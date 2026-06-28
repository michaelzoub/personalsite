from __future__ import annotations

from pathlib import Path
from typing import Any, Callable
import os

from .search import build_research_search_tool


RESEARCH_SYSTEM_PROMPT = """You are Autore Deep, a research agent modeled after a file-backed research harness.

Your job is to turn a user goal into auditable research artifacts:
1. Plan the work before searching.
2. Use internet_search for evidence. Prefer multiple framings rather than one broad query.
3. Write important notes into the agent filesystem when results are large.
4. Delegate focused subtasks to specialized subagents when useful.
5. Critique the evidence before synthesis.
6. Produce a concise final report with sources, confidence, caveats, and open questions.

Final report format:
# Final Report
## Answer
## Evidence
## Caveats
## Open Questions
## Sources

Do not invent citations. If evidence is weak or unavailable, say so plainly.
"""


RESEARCH_SUBAGENTS = [
    {
        "name": "literature-agent",
        "description": "Finds papers, technical reports, docs, and credible sources for a focused research angle.",
        "system_prompt": """You are a literature researcher. Search distinct phrasings, return only the strongest evidence, and include URLs. Keep the result compact.""",
    },
    {
        "name": "critic-agent",
        "description": "Challenges claims, spots missing evidence, contradictions, and overconfident synthesis.",
        "system_prompt": """You are an evidence critic. Identify unsupported claims, likely confounders, and what would change the conclusion. Return concrete fixes.""",
    },
    {
        "name": "synthesis-agent",
        "description": "Turns gathered evidence into a readable report with caveats and source links.",
        "system_prompt": """You are a synthesis writer. Produce a polished report grounded only in provided evidence and source URLs.""",
    },
]


def build_agent(
    *,
    model: str,
    corpus_path: Path,
    store_getter: Callable[[], Any],
    debug: bool = False,
):
    from deepagents import create_deep_agent

    search_tool = build_research_search_tool(corpus_path, store_getter)
    subagents = [{**subagent, "tools": [search_tool]} for subagent in RESEARCH_SUBAGENTS]
    return create_deep_agent(
        model=resolve_model(model),
        tools=[search_tool],
        system_prompt=RESEARCH_SYSTEM_PROMPT,
        subagents=subagents,
        debug=debug,
        name="autore-deep",
    )


def resolve_model(model: str):
    """Resolve menu-friendly model ids into Deep Agents-compatible models."""
    normalized = model.replace("/", ":", 1)
    if normalized == "kimi:kimi-k2.6":
        from langchain_openai import ChatOpenAI

        api_key = os.environ.get("MOONSHOT_API_KEY") or os.environ.get("KIMI_API_KEY")
        if not api_key:
            raise RuntimeError("Kimi K2.6 requires MOONSHOT_API_KEY or KIMI_API_KEY in .env.local.")
        return ChatOpenAI(
            model="kimi-k2.6",
            api_key=api_key,
            base_url=os.environ.get("KIMI_BASE_URL", "https://api.moonshot.ai/v1"),
            temperature=1,
        )
    return model
