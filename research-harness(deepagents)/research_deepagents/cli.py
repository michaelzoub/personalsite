from __future__ import annotations

import argparse
import os
import sys
import termios
import tty
from pathlib import Path
from typing import Callable, Optional

from .orchestrator import HarnessConfig, Orchestrator


MODEL_CHOICES = (
    "openai:gpt-5.4",
    "openai:gpt-5.2",
    "kimi:kimi-k2.6",
    "anthropic:claude-sonnet-4-6",
    "anthropic:claude-sonnet-4-5",
    "google_genai:gemini-3.5-flash",
    "custom",
)
RETRIEVER_CHOICES = ("auto", "local", "tavily")

ANSI = {
    "reset": "\033[0m",
    "bold": "\033[1m",
    "green": "\033[38;5;35m",
    "teal": "\033[38;5;43m",
    "blue": "\033[38;5;39m",
    "gray": "\033[38;5;245m",
    "yellow": "\033[38;5;221m",
    "red": "\033[38;5;203m",
}

LOGO = r"""
    _         _                  ____                 
   / \  _   _| |_ ___  _ __ ___ |  _ \  ___  ___ _ __ 
  / _ \| | | | __/ _ \| '__/ _ \| | | |/ _ \/ _ \ '_ \
 / ___ \ |_| | || (_) | | |  __/| |_| |  __/  __/ |_) |
/_/   \_\__,_|\__\___/|_|  \___||____/ \___|\___| .__/ 
                                                 |_|    
"""


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run Autore Deep, a selection-based Deep Agents research harness.",
    )
    parser.add_argument("goal", nargs="?", help="Research goal. Omit to use the guided setup.")
    parser.add_argument(
        "-i",
        "--interactive",
        action="store_true",
        help="Open the guided selection setup, using supplied flags as defaults.",
    )
    parser.add_argument(
        "--corpus",
        type=Path,
        default=Path(os.environ.get("RESEARCH_DEEPAGENTS_CORPUS_PATH", "examples/corpus/research_corpus.json")),
        help="Local fallback corpus path.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(os.environ.get("RESEARCH_DEEPAGENTS_OUTPUT_DIR", "outputs")),
        help="Directory where run artifacts are written.",
    )
    parser.add_argument(
        "--retriever",
        choices=RETRIEVER_CHOICES,
        default=os.environ.get("RESEARCH_DEEPAGENTS_RETRIEVER", "auto"),
        help="Evidence source preference. Auto uses Tavily when configured and local corpus otherwise.",
    )
    parser.add_argument(
        "--model",
        default=os.environ.get("RESEARCH_DEEPAGENTS_MODEL", "openai:gpt-5.4"),
        help="Deep Agents model string, for example openai:gpt-5.4, kimi:kimi-k2.6, or anthropic:claude-sonnet-4-6.",
    )
    parser.add_argument("--quiet", action="store_true", help="Disable progress echo.")
    parser.add_argument("--debug", action="store_true", help="Enable Deep Agents debug mode.")
    return parser


def load_env_file(path: Path) -> None:
    """Load KEY=VALUE lines from .env.local without adding a runtime dependency."""
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def configure_interactive_run(
    args: argparse.Namespace,
    *,
    input_func: Callable[[str], str] = input,
    output_func: Callable[[str], None] = print,
    key_reader: Optional[Callable[[], str]] = None,
) -> argparse.Namespace:
    _print_cli_banner(output_func=output_func)
    output_func("Ready to run. Existing flags are used as starting values.")
    output_func("Tip: press Enter to accept a default; use Up/Down in menus.")
    output_func("")
    args.goal = prompt_text(
        "What should the research agent work on?",
        default=args.goal,
        required=True,
        input_func=input_func,
        output_func=output_func,
    )
    selected_model = prompt_choice(
        "Which model should Deep Agents use?",
        [
            ("openai:gpt-5.4", "OpenAI GPT-5.4"),
            ("openai:gpt-5.2", "OpenAI GPT-5.2"),
            ("kimi:kimi-k2.6", "Kimi K2.6"),
            ("anthropic:claude-sonnet-4-6", "Claude Sonnet 4.6"),
            ("anthropic:claude-sonnet-4-5", "Claude Sonnet 4.5"),
            ("google_genai:gemini-3.5-flash", "Gemini 3.5 Flash"),
            ("custom", "Type a custom provider:model"),
        ],
        default=args.model if args.model in MODEL_CHOICES else "custom",
        input_func=input_func,
        output_func=output_func,
        key_reader=key_reader,
    )
    if selected_model == "custom":
        selected_model = prompt_text(
            "Model string",
            default=args.model,
            required=True,
            input_func=input_func,
            output_func=output_func,
        )
    args.model = selected_model
    args.retriever = prompt_choice(
        "Where should research evidence come from?",
        [
            ("auto", "Auto: Tavily if TAVILY_API_KEY exists, otherwise local corpus"),
            ("local", "Bundled offline corpus"),
            ("tavily", "Tavily web search"),
        ],
        default=args.retriever or "auto",
        input_func=input_func,
        output_func=output_func,
        key_reader=key_reader,
    )
    output_choice = prompt_choice(
        "Where should artifacts be written?",
        [
            ("outputs", "outputs/"),
            ("custom", "Type a custom output directory"),
        ],
        default="outputs" if args.output == Path("outputs") else "custom",
        input_func=input_func,
        output_func=output_func,
        key_reader=key_reader,
    )
    if output_choice == "custom":
        args.output = Path(
            prompt_text(
                "Output directory",
                default=str(args.output),
                required=True,
                input_func=input_func,
                output_func=output_func,
            )
        )
    else:
        args.output = Path("outputs")
    args.quiet = (
        prompt_choice(
            "Stream progress to the terminal?",
            [("yes", "Yes, show progress"), ("no", "No, quiet mode")],
            default="no" if args.quiet else "yes",
            input_func=input_func,
            output_func=output_func,
            key_reader=key_reader,
        )
        == "no"
    )
    return args


def main(argv: list[str] | None = None) -> int:
    load_env_file(Path(".env.local"))
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.interactive or not args.goal:
        args = configure_interactive_run(args)
    goal = args.goal
    if not goal:
        parser.error("goal is required")
    config = HarnessConfig(model=args.model, retriever=args.retriever, echo_progress=not args.quiet, debug=args.debug)
    run, store = Orchestrator(args.corpus, args.output, config).run(goal)
    print("")
    print("Run complete")
    print(f"status   {run.status}")
    print(f"run      {run.id}")
    print(f"home     {store.root}")
    print(f"report   {store.report_path}")
    print(f"prd      {store.prd_path}")
    print(f"sources  {store.root / 'sources.json'}")
    return 0 if run.status == "completed" else 1


def prompt_choice(
    title: str,
    options: list[tuple[str, str]],
    *,
    default: str,
    input_func: Callable[[str], str] = input,
    output_func: Callable[[str], None] = print,
    key_reader: Optional[Callable[[], str]] = None,
) -> str:
    if key_reader is not None or sys.stdin.isatty():
        return prompt_arrow_choice(title, options, default=default, key_reader=key_reader)
    output_func("")
    output_func(_paint(title, "teal"))
    for index, (value, label) in enumerate(options, start=1):
        suffix = _paint(" [default]", "green") if value == default else ""
        output_func(f"  {_paint(str(index) + '.', 'gray')} {label}{suffix}")
    while True:
        answer = input_func(_paint("Choose a number: ", "blue")).strip()
        if not answer:
            return default
        if answer.isdigit():
            selected_index = int(answer)
            if 1 <= selected_index <= len(options):
                return options[selected_index - 1][0]
        output_func(_paint(f"Please enter 1-{len(options)}, or press Enter for the default.", "yellow"))


def prompt_arrow_choice(
    title: str,
    options: list[tuple[str, str]],
    *,
    default: str,
    key_reader: Optional[Callable[[], str]] = None,
) -> str:
    if not options:
        raise ValueError("prompt_arrow_choice requires at least one option")
    selected_index = next((index for index, (value, _label) in enumerate(options) if value == default), 0)
    read_key = key_reader or read_terminal_key
    lines_rendered = 0
    while True:
        if lines_rendered:
            sys.stdout.write(f"\033[{lines_rendered}F")
        lines = [_paint(title, "teal"), _paint("Use Up/Down, then Enter. Vim keys work too.", "gray")]
        for index, (_value, label) in enumerate(options):
            if index == selected_index:
                lines.append(f"{_paint('>', 'green')} {_paint(label, 'bold')}")
            else:
                lines.append(f"  {_paint(label, 'gray')}")
        for line in lines:
            sys.stdout.write(f"\033[2K\r{line}\n")
        sys.stdout.flush()
        lines_rendered = len(lines)
        key = read_key()
        if key in {"up", "k"}:
            selected_index = (selected_index - 1) % len(options)
        elif key in {"down", "j"}:
            selected_index = (selected_index + 1) % len(options)
        elif key in {"enter", "\r", "\n"}:
            sys.stdout.write("\n")
            sys.stdout.flush()
            return options[selected_index][0]


def read_terminal_key() -> str:
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        char = sys.stdin.read(1)
        if char == "\x1b":
            suffix = sys.stdin.read(2)
            if suffix == "[A":
                return "up"
            if suffix == "[B":
                return "down"
            return "escape"
        if char in {"\r", "\n"}:
            return "enter"
        return char
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)


def prompt_text(
    prompt: str,
    *,
    default: Optional[str] = None,
    required: bool = False,
    input_func: Callable[[str], str] = input,
    output_func: Callable[[str], None] = print,
) -> str:
    rendered = f"{prompt} [{default}]: " if default else f"{prompt}: "
    while True:
        answer = input_func(_paint(rendered, "blue")).strip()
        if answer:
            return answer
        if default is not None:
            return default
        if not required:
            return ""
        output_func(_paint("Please enter a value.", "yellow"))


def _print_cli_banner(*, output_func: Callable[[str], None] = print) -> None:
    output_func(_paint(LOGO.rstrip("\n"), "teal"))
    output_func(_paint("Research with Deep Agents. Plan, search, delegate, leave artifacts.", "bold"))
    output_func("")
    marker = _paint(">", "green")
    output_func(f"{marker} Guided setup: {_paint('./autore', 'blue')}")
    direct_cmd = './autore "Research ..."'
    output_func(f"{marker} Direct run:   {_paint(direct_cmd, 'blue')}")
    output_func("")


def _paint(text: str, color: str) -> str:
    if os.environ.get("NO_COLOR") or not sys.stdout.isatty():
        return text
    return f"{ANSI[color]}{text}{ANSI['reset']}"


if __name__ == "__main__":
    raise SystemExit(main())
