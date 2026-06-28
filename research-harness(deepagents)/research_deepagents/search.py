from __future__ import annotations

import json
import math
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal, Optional

from .schemas import Source


TOKEN_RE = re.compile(r"[a-zA-Z0-9]+")


@dataclass
class CorpusDocument:
    url: str
    title: str
    author: str
    date: str
    source_type: str
    summary: str
    claims: list[str]
    tags: list[str]
    credibility_score: float
    evidence_sections: Optional[dict[str, str]] = None


class LocalCorpusSearch:
    tool_name = "local_corpus_search"

    def __init__(self, corpus_path: Path):
        payload = json.loads(corpus_path.read_text(encoding="utf-8"))
        self.documents = [CorpusDocument(**row) for row in payload]

    def search(self, query: str, limit: int = 5) -> list[tuple[CorpusDocument, float]]:
        query_terms = _tokens(query)
        scored: list[tuple[CorpusDocument, float]] = []
        for document in self.documents:
            haystack = " ".join([document.title, document.summary, " ".join(document.claims), " ".join(document.tags)])
            doc_terms = _tokens(haystack)
            overlap = len(query_terms & doc_terms)
            tag_overlap = len(query_terms & set(document.tags))
            if overlap == 0:
                continue
            score = min(1.0, (overlap + tag_overlap * 1.5) / math.sqrt(max(len(query_terms), 1) * 12))
            scored.append((document, round(score, 3)))
        scored.sort(key=lambda pair: (pair[1], pair[0].credibility_score), reverse=True)
        return scored[:limit]

    def to_source(self, document: CorpusDocument, relevance_score: float) -> Source:
        return Source(
            url=document.url,
            title=document.title,
            author=document.author,
            date=document.date,
            source_type=document.source_type,
            summary=document.summary,
            relevance_score=relevance_score,
            credibility_score=document.credibility_score,
            evidence_sections=document.evidence_sections or {"claims": "\n".join(document.claims)},
        )


def build_research_search_tool(corpus_path: Path, store_getter):
    """Create a Deep Agents-compatible search tool with local fallback.

    Tavily is used when ``TAVILY_API_KEY`` is present. Otherwise this searches the
    bundled corpus so the harness remains useful in offline smoke tests.
    """

    local = LocalCorpusSearch(corpus_path)
    tavily_client = None
    if os.environ.get("TAVILY_API_KEY"):
        try:
            from tavily import TavilyClient

            tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
        except Exception:
            tavily_client = None

    def internet_search(
        query: str,
        max_results: int = 5,
        topic: Literal["general", "news", "finance"] = "general",
        include_raw_content: bool = False,
    ) -> dict[str, Any]:
        """Run web research search with Tavily when configured, else local corpus search."""

        store = store_getter()
        if tavily_client is not None:
            payload = tavily_client.search(
                query,
                max_results=max_results,
                topic=topic,
                include_raw_content=include_raw_content,
            )
            for result in payload.get("results", []):
                store.add_source(
                    Source(
                        url=str(result.get("url") or ""),
                        title=str(result.get("title") or "Untitled"),
                        author="",
                        date="",
                        source_type=topic,
                        summary=str(result.get("content") or result.get("raw_content") or ""),
                        relevance_score=float(result.get("score") or 0.0),
                        credibility_score=0.6,
                    )
                )
            return payload

        results = local.search(query, limit=max_results)
        sources = [store.add_source(local.to_source(document, relevance)) for document, relevance in results]
        return {
            "query": query,
            "provider": local.tool_name,
            "results": [
                {
                    "url": source.url,
                    "title": source.title,
                    "content": source.summary,
                    "score": source.relevance_score,
                    "claims": source.evidence_sections.get("claims", "").splitlines(),
                }
                for source in sources
            ],
        }

    return internet_search


def _tokens(text: str) -> set[str]:
    return {token.lower() for token in TOKEN_RE.findall(text) if len(token) > 2}

