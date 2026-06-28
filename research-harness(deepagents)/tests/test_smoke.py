from __future__ import annotations

import tempfile
import unittest
import contextlib
import io
from pathlib import Path

from research_deepagents.cli import build_parser, configure_interactive_run, prompt_choice
from research_deepagents.agent import resolve_model
from research_deepagents.orchestrator import goal_slug
from research_deepagents.search import LocalCorpusSearch
from research_deepagents.store import ArtifactStore


class SmokeTest(unittest.TestCase):
    def test_cli_accepts_goal_and_model(self) -> None:
        args = build_parser().parse_args(["Research agents", "--model", "openai:gpt-5.4"])

        self.assertEqual(args.goal, "Research agents")
        self.assertEqual(args.model, "openai:gpt-5.4")

    def test_cli_accepts_kimi_k26_model(self) -> None:
        args = build_parser().parse_args(["Research agents", "--model", "kimi:kimi-k2.6"])

        self.assertEqual(args.model, "kimi:kimi-k2.6")

    def test_cli_no_args_opens_guided_setup_shape(self) -> None:
        args = build_parser().parse_args([])

        self.assertIsNone(args.goal)
        self.assertFalse(args.interactive)

    def test_configure_interactive_run_uses_numeric_choices(self) -> None:
        parser = build_parser()
        args = parser.parse_args([])
        answers = iter(
            [
                "Research agent harnesses",
                "2",
                "2",
                "",
                "2",
            ]
        )

        configured = configure_interactive_run(
            args,
            input_func=lambda _prompt: next(answers),
            output_func=lambda _line: None,
        )

        self.assertEqual(configured.goal, "Research agent harnesses")
        self.assertEqual(configured.model, "openai:gpt-5.2")
        self.assertEqual(configured.retriever, "local")
        self.assertEqual(configured.output, Path("outputs"))
        self.assertTrue(configured.quiet)

    def test_configure_interactive_run_can_select_kimi(self) -> None:
        parser = build_parser()
        args = parser.parse_args([])
        answers = iter(
            [
                "Research Kimi",
                "3",
                "",
                "",
                "",
            ]
        )

        configured = configure_interactive_run(
            args,
            input_func=lambda _prompt: next(answers),
            output_func=lambda _line: None,
        )

        self.assertEqual(configured.model, "kimi:kimi-k2.6")

    def test_prompt_choice_accepts_key_reader_for_arrows(self) -> None:
        keys = iter(["down", "enter"])

        with contextlib.redirect_stdout(io.StringIO()):
            selected = prompt_choice(
                "Pick",
                [("a", "A"), ("b", "B")],
                default="a",
                key_reader=lambda: next(keys),
            )

        self.assertEqual(selected, "b")

    def test_non_kimi_model_resolves_to_string(self) -> None:
        self.assertEqual(resolve_model("openai:gpt-5.4"), "openai:gpt-5.4")

    def test_goal_slug_removes_common_words(self) -> None:
        self.assertEqual(goal_slug("Research how agents improve literature review"), "agents-improve-literature-review")

    def test_local_corpus_search_returns_matching_sources(self) -> None:
        search = LocalCorpusSearch(Path("examples/corpus/research_corpus.json"))
        results = search.search("parallel literature review agents", limit=2)

        self.assertTrue(results)
        self.assertIn("Parallel Agent Review", results[0][0].title)

    def test_artifact_store_writes_core_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            store = ArtifactStore(Path(directory) / "run")
            store.append_progress("hello")
            store.write_report("# Report")
            store.write_prd({"status": "planned"})

            self.assertTrue(store.progress_path.exists())
            self.assertTrue(store.report_path.exists())
            self.assertTrue(store.prd_path.exists())


if __name__ == "__main__":
    unittest.main()
