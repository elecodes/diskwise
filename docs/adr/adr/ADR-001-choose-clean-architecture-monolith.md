# ADR-001: Choose Clean Architecture Monolith for diskwise

## Status

Accepted

## Context

diskwise is a new CLI tool to help users safely free disk space by identifying files that are likely safe to delete or compress. The project:

- Is initially maintained by a single developer.
- Must prioritize safety, clarity, and testability.
- Has relatively simple deployment (local CLI, no backend services).

We need to choose an architectural style that balances simplicity and long-term maintainability.

## Decision

We will implement diskwise as a **single-process monolith** organized using **Clean Architecture**:

- `core/` contains pure business logic and domain rules.
- `infra/` handles filesystem and OS interactions.
- `cli/` contains the command-line interface and user interaction.
- `tests/` contains unit, integration, and E2E tests.

Dependencies flow inward toward `core/`, and `core/` does not depend on `infra/` or `cli/`.

## Consequences

### Positive

- Clear separation of concerns: business rules are independent of I/O and UI.
- High testability: `core/` can reach near 100% unit test coverage with fast tests.
- Simple deployment: a single CLI entrypoint is easy to package and distribute.
- Easier to evolve: we can later swap or extend `infra/` or `cli/` without rewriting `core/`.

### Negative

- Requires discipline to keep `core/` pure and avoid leaking infra concerns.
- Might feel over-structured for a small project at the very beginning.
- If diskwise grows into a multi-service product, we may need to refactor or extract components later.

### Review

We will review this ADR when:

- diskwise needs a long-running background service, or
- the project introduces remote/networked components, or
- performance or scaling concerns suggest a different architectural style.
