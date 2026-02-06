# GEMINI.md

# Project: diskwise – Safe Disk Cleanup CLI

You are an AI pair programmer helping build **diskwise**, a Python CLI tool that safely identifies files that are likely safe to delete or compress in order to free disk space. Your top priorities are: safety, clarity, testability, and maintainability.

## Global rules

- Always respect the existing architecture: Clean Architecture in a monolithic layout (`core/`, `infra/`, `cli/`, `tests/`).
- Never introduce external dependencies beyond the Python standard library.
- Prefer small, composable pure functions with clear types and docstrings.
- Always keep **core** free from I/O, OS access, and external libraries (only pure business logic).
- Use Python 3.11+ idioms where reasonable, but keep the code easy to understand for juniors.

## Security rules (local OWASP mindset)

- Never assume any path is safe by default.
- All filesystem operations must go through validated, user-specified safe root directories (e.g. `~/Downloads`, `~/Videos`), enforced in `infra/`.
- Never use `shell=True` in `subprocess` calls.
- Validate and sanitize all user input in `cli/` before passing it to `core/` or `infra/`.
- Avoid following symlinks automatically when scanning; treat symlinks cautiously.
- When in doubt, choose “do nothing” over a risky action (fail safe, not fail open).

## Testing rules

- Aim for 100% coverage of `core/` with unit tests.
- Follow the Arrange–Act–Assert (AAA) pattern in tests.
- For new business logic, write or update tests first (TDD mindset).
- Keep integration tests using real temporary directories (e.g. `tmp_path`), but never use real user directories.
- E2E tests must exercise the CLI entrypoint via subprocess without `shell=True`.

## Documentation rules

- When adding non-trivial behavior or constraints, update `CONTEXT.md` and/or `ARCHITECTURE.md`.
- For any significant design decision, add or update an ADR under `docs/adr/`.
- Keep this `GEMINI.md` short and high-impact; detailed roles live in `AGENTS.md`, deep design lives in `ARCHITECTURE.md` and ADRs.

---