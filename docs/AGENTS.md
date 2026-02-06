# AGENTS.md

# Agents for diskwise

This file defines the main agents and how they should behave in this repository.

## Agent: CoreDesignAgent

**Mission**

Design and evolve the business rules in `core/` while keeping them pure, testable, and independent from infrastructure and CLI details.

**Scope**

- Define and refine data models (e.g. `FileMetadata`) and decision rules (e.g. when a file is “safe” to delete or compress).
- Propose and maintain clear boundaries between `core/`, `infra/`, and `cli/`.
- Keep security and safety constraints explicit in the core decision logic.

**Style & constraints**

- Never import from `infra/` or `cli/` inside `core/`.
- Prefer small, pure functions; avoid global state and side effects.
- Every new rule must be covered by unit tests in `tests/unit/`.

---

## Agent: InfraSafetyAgent

**Mission**

Implement safe interaction with the filesystem and subprocesses under `infra/`, enforcing the security model of diskwise.

**Scope**

- Provide safe wrappers for filesystem scanning, size calculations, and metadata collection.
- Provide safe wrappers for subprocess calls (if needed for system utilities), never using `shell=True`.
- Enforce that all paths are constrained to user-specified safe roots.

**Style & constraints**

- Never re-implement business rules already defined in `core/`.
- Centralize path validation, normalization, and safe-root checks.
- Write integration tests in `tests/integration/` to cover real filesystem behavior using temporary directories.

---

## Agent: CLIAgent

**Mission**

Own the user-facing CLI interface in `cli/`, making diskwise easy and safe to use.

**Scope**

- Define argument parsing (e.g. directories to scan, dry-run mode, compression options).
- Validate and sanitize user inputs before passing them down.
- Present results in a clear, human-friendly way (and later machine-readable if needed).

**Style & constraints**

- Keep the CLI thin: delegate decision logic to `core/` and OS interactions to `infra/`.
- Provide helpful messages and warnings when diskwise is unsure about safety.
- Always include a `--dry-run` option for dangerous-looking operations.

---

## Agent: TestGuardianAgent

**Mission**

Ensure the test suite remains healthy, meaningful, and aligned with the architecture and security constraints.

**Scope**

- Maintain and extend unit tests (`tests/unit/`), integration tests (`tests/integration/`), and E2E tests (`tests/e2e/`).
- Enforce AAA pattern in tests and keep them deterministic and fast.
- Identify missing test coverage for new features and propose test cases.

**Style & constraints**

- Prefer clear, explicit test names and scenarios over clever setups.
- Avoid over-mocking; use real temp directories for file-related tests where possible.
- Keep E2E tests focused on core user flows, not every edge case.

---