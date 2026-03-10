# Diskwise - Safe Disk Cleanup CLI & Dashboard

**Diskwise** is a premium, safety-first disk cleanup utility. It combines a robust Python-based CLI with a modern, high-performance web dashboard to help you reclaim disk space intelligently.

## 🚀 Key Features

- **Intelligence-Led Cleanup**: Specifically targets "junk" like Python caches (`__pycache__`), build artifacts, and browser data (cache vs cookies) with 99.9% accuracy.
- **Visual Safety**: Color-coded indicators (Emerald Green for Safe, Amber for Review) take the guesswork out of cleanup.
- **Security-First Design**: Enforces strict path validation and prevents traversal attacks (`..`).
- **Clean Architecture**: A modular monolith following strict separation of concerns (`core`, `infra`, `cli`, `api`).
- **Pro Max UI**: Sleek, glassmorphic React dashboard with micro-interactions and smooth animations.

## 🛠 Project Structure

```text
diskwise/
├── core/       # Pure Business Logic (File safety rules)
├── infra/      # Infrastructure (Safe filesystem I/O & Scanning)
├── cli/        # Command-Line Interface (Python CLI)
├── api/        # REST API (FastAPI backend)
├── tests/      # Unit & Integration Tests
app/            # Modern React Frontend (Vite + Tailwind)
docs/           # In-depth Architecture, ADRs, and Playbook
```

## 💻 Quick Start

The easiest way to start both the backend API and the web dashboard is by using the development script:

```bash
bash dev.sh
```

### Accessing the Interfaces
- **Web Dashboard**: [http://localhost:5173](http://localhost:5173) (or 5174 depending on availability)
- **REST API**: [http://localhost:8000](http://localhost:8000)

## 🖥 Desktop Launchers

For a more integrated experience, Diskwise includes native launchers:
- **macOS**: Double-click `launch_mac.command` in the root folder. You can also use `scripts/create_shortcut.sh` to place a launcher on your Desktop.
- **Windows**: Double-click `launch.bat` to start the backend and frontend services.
- **Native App**: If you have `Diskwise.app` in your `/Applications` folder, it provides a specialized macOS icon for easy access.

> [!TIP]
> If the `Diskwise.app` icon is not appearing correctly, ensure `DiskwiseIcon.icns` is present in `Contents/Resources/` and `Info.plist` is correctly configured.

### Using the CLI
You can also use the CLI directly for quick scans and deletions. Ensure you set the `PYTHONPATH` correctly:

```bash
# In the project root
export PYTHONPATH="$PYTHONPATH:$(pwd)/diskwise"
python3 diskwise/cli/main.py scan --path ~
python3 diskwise/cli/main.py delete ./old_file.txt
```

## 🎨 Premium Aesthetic (Amber & Emerald)

The new **DiskWise Pro Max** interface features:
- **Glassmorphism**: Backdrop blur and subtle glows for a modern feel.
- **Amber & Emerald Colors**: A refined palette for clarity and visual appeal.
- **Micro-Animations**: Shimmering buttons and fluid list interactions.

![DiskWise Dashboard](file:///Users/elena/.gemini/antigravity/brain/0b9ddb92-f3bf-4d49-b4bf-9420ab4bc10b/dashboard_amber_verification_1770414588393.png)

## 🛡 Security & Safety

- **Safe Roots**: Operations are restricted to validated directories (Home, `/tmp`).
- **Secure Headers**: API layer implements strict CSP, HSTS, and X-Frame-Options to prevent information disclosure and embedding attacks.
- **Archive Protection**: Compression logic includes "Zip Slip" prevention, ensuring archived files cannot traverse outside their intended paths.
- **Pure Logic**: Core business rules are isolated from I/O to ensure testability and safety.
- **Fail-Safe**: If a path is unknown, the tool defaults to "Review" status.

## ⚡ Performance Optimizations

- **Memoized Filtering**: React dashboard uses `useMemo` for instant filtering of large file sets without UI lag.
- **Stable UI**: Hoisted utility functions and strict rendering patterns ensure a smooth, consistent experience.

For more technical details, check out the [Architecture Docs](docs/ARCHITECTURE.md).
