# skills/safe-disk-scan/SKILL.md

---
name: safe-disk-scan
description: >
  Help design and review safe disk scans that respect architecture and security constraints in diskwise.
---

# Skill: safe-disk-scan

## Goal

Guide the design and review of filesystem scan logic for diskwise so that it:

- Respects the Clean Architecture boundaries (`core/` vs `infra/`).
- Enforces safe-root path constraints and avoids path traversal.
- Produces metadata that `core/` can use to decide what is “safe” to delete or compress.

## When to use this skill

- When adding or modifying code that scans directories or inspects files.
- When adding new rules about which files are candidates for deletion/compression.
- When uncertain whether a change might violate security or architecture rules.

## Instructions

When using this skill:

1. Read `CONTEXT.md` to understand what diskwise is trying to achieve.
2. Read `ARCHITECTURE.md` to understand the intended boundaries between `core/`, `infra/`, and `cli/`.
3. Propose or review the scan logic so that:
   - Path validation and safe-root checks live in `infra/`.
   - File decision rules (safe/unsafe/unknown) live in `core/`.
4. Suggest concrete tests:
   - Unit tests for decision rules in `core/`.
   - Integration tests for scanning temporary directories in `infra/`.
   - E2E tests for CLI flows using `diskwise` on a temp directory.
5. Highlight any potential security risks (e.g. following symlinks, unexpected path traversal, overly aggressive deletions).

## Examples

**Example 1 – Designing a new scan**

- Input: “We want to scan `~/Downloads` and flag `.whl` and `.tar.gz` files older than 90 days as candidates for deletion.”
- Behavior:
  - In `infra/`: implement a scanner that walks only under a validated `~/Downloads` root and collects `FileMetadata` with path, size, timestamps.
  - In `core/`: implement a rule that marks old `.whl` and `.tar.gz` as “candidate” but never auto-deletes them.

**Example 2 – Reviewing an unsafe proposal**

- Input: “Let’s run `du -sh` using `subprocess.run('du -sh ' + user_dir, shell=True)`.”
- Behavior:
  - Reject this proposal.
  - Recommend a safe alternative that:
    - Avoids `shell=True`.
    - Validates and normalizes the directory path against safe roots.