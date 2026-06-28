from __future__ import annotations

import hashlib
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Optional

from .agent import RESEARCH_SYSTEM_PROMPT, build_agent
from .schemas import AgentTrace, FailedPath, RunRecord, now_iso
from .store import ArtifactStore


RUN_SLUG_STOPWORDS = {"a", "an", "and", "for", "how", "in", "of", "on", "please", "research", "the", "to", "what"}


@dataclass
class HarnessConfig:
    id: str = "deepagents-research-harness-v1"
    model: str = "openai:gpt-5.4"
    retriever: str = "auto"
    echo_progress: bool = True
    debug: bool = False


class Orchestrator:
    def __init__(self, corpus_path: Path, output_root: Path, config: Optional[HarnessConfig] = None):
        self.corpus_path = corpus_path
        self.output_root = output_root
        self.config = config or HarnessConfig()
        self._active_store: Optional[ArtifactStore] = None

    def run(self, goal: str) -> tuple[RunRecord, ArtifactStore]:
        run = RunRecord(
            id=self._next_run_id(goal),
            user_goal=goal,
            harness_config_id=self.config.id,
            model=self.config.model,
            retriever=self.config.retriever,
            prompt_versions={"research_system_prompt": _sha256(RESEARCH_SYSTEM_PROMPT)},
            harness_config_snapshot=asdict(self.config),
        )
        store = ArtifactStore(self.output_root / run.id, echo_progress=self.config.echo_progress)
        self._active_store = store
        store.add_run(run)
        store.append_progress(f"Starting run {run.id}")
        store.append_progress(f"Goal: {goal}")
        store.write_prd(
            {
                "run_id": run.id,
                "goal": goal,
                "status": run.status,
                "architecture": {
                    "orchestrator": "research_deepagents.orchestrator.Orchestrator",
                    "agent_factory": "research_deepagents.agent.build_agent",
                    "deepagents": "create_deep_agent",
                    "artifacts": ["final_report.md", "prd.json", "sources.json", "agent_traces.json", "trace.jsonl", "deepagents_state.json"],
                },
                "acceptance_criteria": [
                    "Agent plans before synthesis.",
                    "Evidence is gathered through internet_search.",
                    "Final report includes sources and caveats.",
                    "Run artifacts are written to the output directory.",
                ],
            }
        )
        try:
            agent = build_agent(
                model=self.config.model,
                corpus_path=self.corpus_path,
                store_getter=lambda: self._require_store(),
                debug=self.config.debug,
            )
            store.append_progress("Deep agent compiled; invoking research loop.")
            state = agent.invoke({"messages": [{"role": "user", "content": goal}]})
            store.write_raw_state(state)
            report = _extract_final_message(state)
            store.write_report(report)
            run.status = "completed"
            store.add_trace(
                AgentTrace(
                    run_id=run.id,
                    agent_name="autore-deep",
                    role="deepagents_orchestrator",
                    status="completed",
                    output_summary=_summarize(report),
                    tools_used=["internet_search", "write_todos", "filesystem", "task"],
                    completed_at=now_iso(),
                )
            )
            store.append_progress(f"Final report: {store.report_path}")
        except Exception as exc:
            run.status = "failed"
            store.add_failed_path(
                FailedPath(
                    description="Deep Agents run failed",
                    reason=f"{type(exc).__name__}: {exc}",
                    created_by_agent="autore-deep",
                    run_id=run.id,
                )
            )
            store.write_report(f"# Final Report\n\nRun failed before synthesis.\n\nError: `{type(exc).__name__}: {exc}`\n")
            store.append_progress(f"Run failed: {type(exc).__name__}: {exc}")
            raise
        finally:
            run.completed_at = now_iso()
            store.update_run(run)
            prd = store.prd_path.read_text(encoding="utf-8")
            store.write_prd({**__import__("json").loads(prd), "status": run.status, "completed_at": run.completed_at})
            self._active_store = None
        return run, store

    def _require_store(self) -> ArtifactStore:
        if self._active_store is None:
            raise RuntimeError("No active artifact store")
        return self._active_store

    def _next_run_id(self, goal: str) -> str:
        slug = goal_slug(goal)
        existing = sorted(self.output_root.glob(f"*_run_{slug}"))
        return f"{len(existing) + 1:03d}_run_{slug}"


def goal_slug(goal: str, max_words: int = 12) -> str:
    words = [word for word in re.findall(r"[a-zA-Z0-9]+", goal.lower()) if word not in RUN_SLUG_STOPWORDS]
    return "-".join(words[:max_words]) or "research"


def _extract_final_message(state: dict) -> str:
    messages = state.get("messages", [])
    if not messages:
        return "# Final Report\n\nNo response was returned by the agent.\n"
    last = messages[-1]
    content = getattr(last, "content", None)
    if content is None and isinstance(last, dict):
        content = last.get("content")
    return str(content or "").strip() or "# Final Report\n\nThe agent returned an empty final message.\n"


def _summarize(text: str, limit: int = 240) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    return compact[:limit] + ("..." if len(compact) > limit else "")


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

