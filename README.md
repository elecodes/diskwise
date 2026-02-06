# Diskwise - Safe Disk Cleanup CLI

**Diskwise** is a Python-based CLI tool designed to safely identify files and directories that are likely safe to delete or compress to reclaim disk space.

## Features

- **Safe Cleanup**: Specifically targets "junk" files like Python caches (`__pycache__`), build artifacts, and logs.
- **Security First**: Enforces strict path validation and protects against path traversal attacks.
- **Clean Architecture**: Built with a clear separation between business logic (`core`), system interaction (`infra`), and user interface (`cli`).
- **REST API**: Includes a FastAPI backend for web integration.

## Project Structure

```text
diskwise/
├── core/       # Pure business logic (rules)
├── infra/      # Filesystem scanning & I/O
├── cli/        # Command-line interface
├── api/        # FastAPI backend
└── tests/      # Unit and integration tests
app/            # (Future) Web frontend
docs/           # Project documentation & ADRs
```

## Quick Start (CLI)

1. **Navigate to the diskwise directory**:
   ```bash
   cd diskwise
   ```

2. **Run a scan**:
   ```bash
   export PYTHONPATH=.
   python3 cli/main.py scan --path ~
   ```

3. **Check a specific file**:
   ```bash
   export PYTHONPATH=.
   python3 cli/main.py check ~/Downloads/my_file.zip
   ```

## Quick Start (API)

1. **Install dependencies**:
   ```bash
   cd diskwise
   pip install -r requirements-api.txt
   ```

2. **Start the API server**:
   ```bash
   export PYTHONPATH=.
   python3 api/main.py
   ```
   The API will be available at `http://localhost:8000`.

## Architecture & Security

- All filesystem operations are restricted to allowed roots (e.g., your Home folder and `/tmp`).
- Path traversal using `..` is explicitly blocked for safety.
- Business rules are pure functions that don't perform I/O.

For more details, see the [Documentation](docs/ARCHITECTURE.md).
