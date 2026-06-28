from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .schemas import AgentTrace, FailedPath, RunRecord, Source, now_iso, to_dict


ENTITY_FILES = {
    "runs": "runs.json",
    "sources": "sources.json",
    "agent_traces": "agent_traces.json",
    "failed_paths": "failed_paths.json",
}


class ArtifactStore:
    """Small file-backed store shaped like the original research harness outputs."""

    def __init__(self, root: Path, echo_progress: bool = False):
        self.root = root
        self.echo_progress = echo_progress
        self.root.mkdir(parents=True, exist_ok=True)
        for filename in ENTITY_FILES.values():
            path = self.root / filename
            if not path.exists():
                path.write_text("[]\n", encoding="utf-8")
        self.report_path = self.root / "final_report.md"
        self.prd_path = self.root / "prd.json"
        self.progress_path = self.root / "progress.txt"
        self.trace_log_path = self.root / "trace.jsonl"
        self.raw_state_path = self.root / "deepagents_state.json"
        if not self.progress_path.exists():
            self.progress_path.write_text("", encoding="utf-8")

    def append_progress(self, message: str) -> None:
        line = f"[{now_iso()}] {message}"
        with self.progress_path.open("a", encoding="utf-8") as handle:
            handle.write(line + "\n")
        if self.echo_progress:
            print(line)

    def add_run(self, run: RunRecord) -> None:
        self._append("runs", run)

    def update_run(self, run: RunRecord) -> None:
        rows = self.list("runs")
        for index, row in enumerate(rows):
            if row.get("id") == run.id:
                rows[index] = to_dict(run)
                self._write("runs", rows)
                return
        self.add_run(run)

    def add_source(self, source: Source) -> Source:
        for row in self.list("sources"):
            if row.get("url") == source.url:
                return Source(**row)
        self._append("sources", source)
        return source

    def add_trace(self, trace: AgentTrace) -> None:
        self._append("agent_traces", trace)
        with self.trace_log_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(to_dict(trace), sort_keys=True) + "\n")

    def add_failed_path(self, failed_path: FailedPath) -> None:
        self._append("failed_paths", failed_path)

    def write_report(self, text: str) -> None:
        self.report_path.write_text(text.rstrip() + "\n", encoding="utf-8")

    def write_prd(self, payload: dict[str, Any]) -> None:
        self.prd_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    def write_raw_state(self, payload: dict[str, Any]) -> None:
        self.raw_state_path.write_text(json.dumps(_jsonable(payload), indent=2, sort_keys=True) + "\n", encoding="utf-8")

    def list(self, collection: str) -> list[dict[str, Any]]:
        path = self.root / ENTITY_FILES[collection]
        return json.loads(path.read_text(encoding="utf-8"))

    def _append(self, collection: str, value: Any) -> None:
        rows = self.list(collection)
        rows.append(to_dict(value))
        self._write(collection, rows)

    def _write(self, collection: str, rows: list[dict[str, Any]]) -> None:
        path = self.root / ENTITY_FILES[collection]
        path.write_text(json.dumps(rows, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def _jsonable(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): _jsonable(inner) for key, inner in value.items()}
    if isinstance(value, list):
        return [_jsonable(inner) for inner in value]
    if isinstance(value, tuple):
        return [_jsonable(inner) for inner in value]
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    if hasattr(value, "content"):
        return {"type": value.__class__.__name__, "content": getattr(value, "content")}
    return repr(value)

