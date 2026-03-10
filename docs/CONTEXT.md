# CONTEXT.md

# Context: diskwise

## Problem

Modern development machines accumulate many gigabytes of unused or temporary files (e.g. old virtual environments, build artifacts, caches, logs, downloads). Users often:

- Don’t know which files are safe to delete.
- Are afraid of breaking their system or projects.
- Lack a quick, trustworthy overview of “safe wins” for reclaiming disk space.

## Vision

diskwise is a **local-only tool** that provides both a CLI and a modern Web Dashboard to:

- Scans selected directories.
- Identifies files and folders that are *likely* safe to delete or compress.
- Explains why they are considered safe.
- Encourages the user to review and confirm actions.

diskwise **never** deletes files automatically without explicit user confirmation (and ideally a `--dry-run` preview first).

## Target users

- Developers with cluttered projects and virtual environments.
- Power users with large download folders and media folders.
- People who prefer a CLI for automation or integration in scripts.

## Main use cases

- “Show me Python-related artifacts that might be safe to delete (old virtualenvs, build folders, egg-info, etc.).”
- “Find large files or directories in my downloads that I probably don’t need anymore.”
- “List candidates for compression instead of deletion (e.g. old archives, media, project backups).”
- “Export a report of potential cleanup targets for manual review.”

## Safety Knowledge: Browser Data

When cleaning up browser-related folders, it's important to distinguish between different types of data:

- **Browser Cache**: (e.g., `Cache`, `Code Cache`, `GPUCache`). **Safe to delete.** These are temporary files and will be recreated as needed. Deleting them is a quick win for disk space.
- **Cookies & Storage**: (e.g., `Cookies`, `Local Storage`, `IndexedDB`). **Safe but impactful.** Deleting these will free space but will sign you out of most websites and might delete offline data or site preferences.

---
## Constraints and non-goals

- **Local only**: no network calls, no telemetry, no cloud services.
- **Safety over aggression**: better to miss some cleanup opportunities than to risk breaking user environments.
- Not a full backup or sync solution.
- **Web Dashboard & CLI**: Offers a premium visual experience alongside a robust command-line tool.

---
