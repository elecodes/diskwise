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

---

## 6. Running the System (Operations Guide)

To ensure consistency, follow these procedures to run the different components of **diskwise**.

### A. Using the Development Script (Recommended)
The fastest way to get both the dashboard and API running.
1. In the root directory: `bash dev.sh`
2. This script automates dependency checks, environment variables, and launches both services.

### B. The CLI Tool
Use the CLI for quick scans and security checks on specific paths.
1. Navigate to the module root.
2. Set path: `export PYTHONPATH="$PYTHONPATH:$(pwd)/diskwise"`
3. Execute: `python3 diskwise/cli/main.py scan --path /tmp` (or `check`)

### B. The REST API
The API must be running for the Web Dashboard to function.
1.  Navigate to the module: `cd diskwise`
2.  Set path: `export PYTHONPATH=.`
3.  Start server: `python3 api/main.py`
4.  Default URL: `http://localhost:8000`

### C. The Web Dashboard
The frontend interface for visual analysis.
1.  Navigate to the app: `cd app`
2.  Install dependencies (first time only): `npm install`
3.  Start dev server: `npm run dev`
4.  Default URL: `http://localhost:5173/`

### D. Maintenance & Logs
- **Cleanup**: The tool creates `__pycache__` folders and `.pyc` files when running. These are automatically ignored by git but can be cleared using the tool itself.
- **Port Conflicts**: If port 8000 or 5173 is busy, ensure you close previous instances of the server before restarting.