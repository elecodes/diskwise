# ARCHITECTURE.md

# Architecture: diskwise

## High-level pattern

diskwise uses a **Clean Architecture** in a single-process monolith:

- `core/`: pure business logic and domain rules.
- `infra/`: interaction with the operating system (filesystem, subprocesses, environment).
- `cli/`: argument parsing and user interaction via the command line.
- `api/`: REST API layer with security middleware.
- `tests/`: unit, integration, and E2E tests.

### Core (`core/`)

Responsibilities:

- Define core domain models (e.g. `FileMetadata`).
- Express rules such as “is this file likely safe to delete/compress?” based on metadata + context.
- Combine rules into higher-level decisions (e.g. risk levels, recommended actions).

Constraints:

- No direct filesystem or subprocess access.
- No knowledge of the CLI argument parsing.
- No external libraries beyond Python stdlib (and generally just typing / dataclasses / collections, etc.).

### Infra (`infra/`)

Responsibilities:

- Safe filesystem scanning (`Path` traversal under user-specified roots).
- File metadata extraction (size, type, timestamps, potential language/tooling hints).
- Optional subprocess wrappers (e.g. for `du`, if needed) **without** `shell=True`.

Constraints:

- Centralize input validation for filesystem paths.
- Enforce safe roots and prevent path traversal.
- Expose simple functions or classes that `core/` can consume via abstractions if needed.

### CLI (`cli/`)

Responsibilities:

- Provide a `diskwise` entrypoint using `argparse` (or similar stdlib).
- Accept user options: directories to scan, filters (languages, extensions), dry-run, output format, etc.
- Present results clearly, with emphasis on safety and explanation.

Constraints:

- Validate and normalize user inputs before passing them to `core/` or `infra/`.
- Keep complex decision logic inside `core/`.

### Tests (`tests/`)

Layout (initial idea):

- `tests/unit/`: tests for `core/` functions and small units of `infra/`.
- `tests/integration/`: tests that use real temporary directories and/or subprocesses with `diskwise` components.
- `tests/e2e/`: tests that execute the CLI as a subprocess entrypoint (without `shell=True`).

---

## Cross-cutting concerns

### Security

- All filesystem operations must be constrained to validated safe roots.
- All compression operations use explicit `arcname` validation to prevent Zip Slip (path traversal) vulnerabilities.
- Handle symlinks explicitly (follow or not follow) and document the behavior.
- When in doubt about safety, mark a file as “unknown / risky” instead of “safe”.
- **API Security**: Implements `SecureHeadersMiddleware` to enforce CSP, HSTS, and X-Frame-Options.

### Observability (future)

- Keep the architecture ready to plug in logging in `infra/` and `cli/` without polluting `core/`.
- Avoid printing from `core/`; return values instead.

---

## Frontend Architecture (`app/`)

The web dashboard is a React-based SPA built with Vite.

### Core Principles
- **Performance**: Heavy filtering and calculations are memoized using `useMemo` to ensure smoothness with large datasets.
- **State Management**: Uses local `useState` for UI state and `api.ts` for backend communication.
- **Visual Feedback**: Implements a "toast-first" feedback system for long-running operations like scanning or compression.
- **Stability**: Follows the pattern of hoisting non-reactive logic outside components and using explicit ternary operators for deterministic rendering.

---

## Launch & Packaging

Diskwise is distributed as a source-based CLI but provides convenience wrappers for desktop use:
- **Scripts**: `launch_mac.command` (macOS) and `launch.bat` (Windows) provide one-click startup of both FastAPI backend and React frontend.
- **macOS Bundle**: An optional `Diskwise.app` (Automator-based) wraps the launch script with a custom icon (`DiskwiseIcon.icns`) for a native look and feel.

---
