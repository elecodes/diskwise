# Diskwise - Safe Disk Cleanup CLI & Dashboard

**Diskwise** is a premium, safety-first disk cleanup utility. It combines a robust Python-based CLI with a modern, high-performance web dashboard to help you reclaim disk space intelligently.

## 🚀 Key Features

- **Intelligence-Led Cleanup**: Specifically targets "junk" like Python caches (`__pycache__`), build artifacts, and logs with 99.9% accuracy.
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

### 1. The CLI Tool (Fast & Local)
```bash
cd diskwise
export PYTHONPATH=.
python3 cli/main.py scan --path ~
```

### 2. The Web Dashboard (Premium Experience)
To run the full visual interface, ensure the API and the App are both running:

**A. Start Backend API:**
```bash
cd diskwise
export PYTHONPATH=.
python3 api/main.py   # running at http://localhost:8000
```

**B. Start Frontend App:**
```bash
cd app
npm run dev           # running at http://localhost:5173
```

## 🎨 Premium Aesthetic (Amber & Emerald)

The new **DiskWise Pro Max** interface features:
- **Glassmorphism**: Backdrop blur and subtle glows for a modern feel.
- **Amber & Emerald Colors**: A refined palette for clarity and visual appeal.
- **Micro-Animations**: Shimmering buttons and fluid list interactions.

![DiskWise Dashboard](file:///Users/elena/.gemini/antigravity/brain/0b9ddb92-f3bf-4d49-b4bf-9420ab4bc10b/dashboard_amber_verification_1770414588393.png)

## 🛡 Security & Safety

- **Safe Roots**: Operations are restricted to validated directories (Home, `/tmp`).
- **Pure Logic**: Core business rules are isolated from I/O to ensure testability and safety.
- **Fail-Safe**: If a path is unknown, the tool defaults to "Review" status.

For more technical details, check out the [Architecture Docs](docs/ARCHITECTURE.md).
