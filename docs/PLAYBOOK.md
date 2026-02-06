# PLAYBOOK.md

# Developer Playbook for diskwise

This playbook describes how to work on diskwise in a consistent way.

## 1. Before coding

1. Identify the feature or change you want to make.
2. Check `CONTEXT.md` to ensure the feature fits the product vision.
3. Check `ARCHITECTURE.md` to understand where the change belongs (`core/`, `infra/`, `cli/`).
4. If it’s a significant design decision, consider creating or updating an ADR.

## 2. Designing a change

1. For business rules (decisions about “safe to delete/compress”), design them in `core/`.
2. For filesystem or OS interactions, design them in `infra/`.
3. For UX/interaction, design them in `cli/`.
4. Think about how you will test it:
   - Unit tests (AAA) for pure logic.
   - Integration tests for real filesystem behavior.
   - E2E tests for full CLI flows.

## 3. Implementing with TDD

1. Start by adding or updating tests under `tests/`:
   - Unit: target `core/` first.
   - Integration: use temporary directories for file operations.
   - E2E: call the CLI entrypoint as a subprocess without `shell=True`.
2. Run tests and watch them fail (Red).
3. Implement the minimal logic to make them pass (Green).
4. Refactor while keeping tests green (Refactor).

## 4. Security checklist for changes

Before completing any change, verify:

- No new use of `shell=True` in subprocess calls.
- Paths are validated against safe roots and normalized.
- No direct filesystem access from `core/`.
- Inputs from CLI are validated/sanitized before use.

## 5. Documentation and housekeeping

When you finish a meaningful change:

1. Update `CONTEXT.md` if you changed the product behavior or added a new use case.
2. Update `ARCHITECTURE.md` if you added or altered structural elements.
3. Add or update an ADR in `docs/adr/` for important design decisions.
4. Consider adding a new skill or updating an existing one in `skills/` if the workflow is reusable.