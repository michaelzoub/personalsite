from __future__ import annotations

from dataclasses import asdict, dataclass, field, is_dataclass
from datetime import datetime, timezone
from typing import Any, Literal, Optional
from uuid import uuid4


RunStatus = Literal["running", "completed", "failed", "cancelled"]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


def to_dict(value: Any) -> dict[str, Any]:
    if is_dataclass(value):
        return asdict(value)
    if isinstance(value, dict):
        return value
    raise TypeError(f"Cannot serialize {type(value)!r}")


@dataclass
class RunRecord:
    user_goal: str
    harness_config_id: str
    status: RunStatus = "running"
    started_at: str = field(default_factory=now_iso)
    completed_at: Optional[str] = None
    id: str = field(default_factory=lambda: new_id("run"))
    model: str = ""
    retriever: str = "auto"
    prompt_versions: dict[str, str] = field(default_factory=dict)
    harness_config_snapshot: dict[str, Any] = field(default_factory=dict)


@dataclass
class Source:
    url: str
    title: str
    author: str
    date: str
    source_type: str
    summary: str
    relevance_score: float
    credibility_score: float
    evidence_sections: dict[str, str] = field(default_factory=dict)
    id: str = field(default_factory=lambda: new_id("src"))
    retrieved_at: str = field(default_factory=now_iso)


@dataclass
class AgentTrace:
    run_id: str
    agent_name: str
    role: str
    status: str
    output_summary: str
    tools_used: list[str] = field(default_factory=list)
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    started_at: str = field(default_factory=now_iso)
    completed_at: Optional[str] = None
    id: str = field(default_factory=lambda: new_id("trace"))


@dataclass
class FailedPath:
    description: str
    reason: str
    created_by_agent: str
    run_id: str
    id: str = field(default_factory=lambda: new_id("fail"))

