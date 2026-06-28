# research-deepagents

This is a compact scaffold of the original `research-harness`, rebuilt around LangChain Deep Agents.

The mental model is intentionally familiar:

```text
your prompt -> orchestrator -> Deep Agents research loop -> report + artifacts
```

Deep Agents supplies the planning tool, virtual filesystem tools, and subagent delegation. This package keeps the original harness-style wrapper: run IDs, `outputs/<run>/`, progress logs, source tables, traces, a PRD file, and a final report.

## Quick Start

```bash
./autore
```

Running `./autore` opens the selection-based setup: goal, model, evidence source, output directory, and progress display.
The wrapper uses `uv run` so dependencies such as `deepagents` are installed into a project-managed environment instead of the system Python.

For a direct run from this project directory:

```bash
./autore "Research how multi-agent systems improve literature review quality" --model openai:gpt-5.4
```

The CLI automatically loads `.env.local` from this directory before starting the run.
Kimi is available as:

```bash
./autore "Research agentic coding models" --model kimi:kimi-k2.6
```

By default the agent uses:

```text
RESEARCH_DEEPAGENTS_MODEL=openai:gpt-5.4
RESEARCH_DEEPAGENTS_CORPUS_PATH=examples/corpus/research_corpus.json
RESEARCH_DEEPAGENTS_OUTPUT_DIR=outputs
```

Set your model provider key, for example:

```bash
export OPENAI_API_KEY=sk-...
```

Set `TAVILY_API_KEY` for live web search. Without Tavily, `internet_search` falls back to the bundled local corpus, which keeps smoke tests and demos deterministic.

## Architecture

| Original harness idea | Deep Agents scaffold |
| --- | --- |
| `Orchestrator` owns run lifecycle | `research_deepagents.orchestrator.Orchestrator` |
| `ArtifactStore` writes auditable outputs | `research_deepagents.store.ArtifactStore` |
| Literature / critic / synthesis agents | Deep Agents subagents with focused prompts |
| Search backends | One `internet_search` tool with Tavily plus local fallback |
| `final_report.md`, `prd.json`, traces | Same files in `outputs/<run_id>/` |

The key factory is `research_deepagents.agent.build_agent`, which calls `deepagents.create_deep_agent(...)`.

## Useful Commands

```bash
./autore
./autore --interactive --model anthropic:claude-sonnet-4-6
./autore --interactive --model kimi:kimi-k2.6
./autore "Find evidence about agentic literature review systems" --quiet
./autore-deep "Research adaptive agent harnesses" --model anthropic:claude-sonnet-4-6
python3 -m unittest
```

## Output Files

| File | Purpose |
| --- | --- |
| `final_report.md` | Human-readable answer with sources and caveats. |
| `prd.json` | Run plan, acceptance criteria, and architecture snapshot. |
| `sources.json` | Sources captured by the search tool. |
| `agent_traces.json` / `trace.jsonl` | Minimal trace records for auditing. |
| `deepagents_state.json` | Serialized final Deep Agents state for debugging. |
| `progress.txt` | Timestamped run log. |
