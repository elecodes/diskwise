# Adaptive Project Structure Analysis Skill

## Purpose

This skill is an **analysis-first architectural skill** designed to evaluate, validate, and *conditionally* refactor project structures **only when necessary**.

It is explicitly built to **coexist with other skills**, especially those enforcing **Clean Architecture, Hexagonal Architecture, or DDD**, without causing conflicts or redundant restructuring.

This skill applies to **Python, JavaScript, and TypeScript** projects.

---

## Core Principle

> Architecture exists to reduce the cost of change.
> If the cost of change is already low, **do nothing**.

This skill must never reorganize a project purely for aesthetics or personal preference.

---

## Responsibilities

* Analyze an existing project’s structure
* Determine whether structural refactoring is needed
* Respect and defer to existing architecture patterns
* Propose **incremental, safe, reversible** changes only when required
* Generate documentation instead of refactors when structure is already healthy

---

## Compatibility Rule (Critical)

* If the project already follows **Clean Architecture, Hexagonal Architecture, or DDD**:

  * ❌ Do not reorganize
  * ✅ Validate and document only

* If responsibilities are clearly separated:

  * ❌ Do not impose a new structure

* This skill must never override or contradict other architecture-enforcing skills

This skill may act as:

* 🟢 Validator
* 🟡 Advisor
* 🔴 Refactor Guide

---

## Phase 1 — Project Analysis (Mandatory)

Before any recommendation is made, analyze:

1. **Language(s)**

   * Python
   * JavaScript
   * TypeScript

2. **Project Type**

   * Backend
   * Frontend
   * Full-stack / Monorepo

3. **Architecture Signals**

   * Clean Architecture
   * Hexagonal
   * DDD
   * Layered / MVC
   * Ad-hoc / Mixed

4. **Project Maturity**

   * Prototype
   * Growing product
   * Production system

⚠️ No refactor suggestions are allowed before this analysis is complete.

---

## Phase 2 — Structural Health Check

### 🟢 Green — Healthy

Signals:

* Clear separation of layers
* Frontend and backend isolated
* Configuration centralized
* Business logic not in routes or UI

Action:

* Validate architecture
* Generate documentation only

---

### 🟡 Yellow — Advisory

Signals:

* Minor mixing of concerns
* Monorepo without strict boundaries
* Partial config centralization

Action:

* Suggest incremental improvements
* No enforced refactor

---

### 🔴 Red — Refactor Required

Signals:

* Frontend and backend mixed
* Hardcoded secrets or configs
* Business logic inside controllers or UI
* Unclear folder ownership

Action:

* Propose a **staged, low-risk refactor plan**

---

## Refactor Rules (Red Only)

If refactoring is required:

* Changes must be incremental and reversible
* Prefer moving files over rewriting logic
* No framework rewrites
* Every change must include justification

---

## Reference Structure (Applied Conditionally)

This structure is a **reference**, not a mandate. Apply only what solves detected problems.

```
backend/
├── app/
│   ├── main / index / server
│   ├── api/
│   │   └── v1/
│   ├── core/           # configuration & infrastructure
│   ├── db/
│   ├── models/
│   ├── schemas / dtos
│   ├── services/
│   ├── repositories/
│   └── utils/
frontend/
├── src/
docs/
```

---

## Environment & Configuration Rules

* Always use `.env` and `.env.example`
* Never hardcode secrets
* Configuration belongs to a dedicated layer (`core/`, `config/`)

---

## Documentation Requirements

Always generate or update:

```
docs/
├── architecture.md
├── decisions.md
├── conventions.md
```

If no refactor is needed, generate:

* `architecture-validation.md`

---

## JS Doc / TS Doc / Python Doc Rules

### General Rule

All **public-facing code** must be documented.
Documentation should explain **intent**, not implementation details.

---

### JavaScript (JSDoc)

Required for:

* Services
* Repositories
* Public functions

Example:

```
/**
 * Fetches a user by ID
 * @param {string} userId - Unique user identifier
 * @returns {Promise<User>} User entity
 */
async function getUserById(userId) {}
```

---

### TypeScript (TSDoc)

Required for:

* Public interfaces
* Services
* Domain models

Example:

```
/**
 * Represents a User domain entity
 */
export interface User {
  id: string
  email: string
}
```

---

### Python (Docstrings)

Required for:

* Services
* Repositories
* Core configuration

Example:

```
def get_user(user_id: str) -> User:
    """
    Retrieve a user by unique identifier.

    :param user_id: User unique ID
    :return: User entity
    """
```

---

## Output Contract

All outputs from this skill must follow this order:

1. Architecture summary
2. Structural health status (Green / Yellow / Red)
3. Justification
4. Recommended actions (if any)
5. Safe execution checklist

---

## Hard Constraints

* Do not refactor healthy architecture
* Do not conflict with Clean Architecture skills
* Do not reorganize for aesthetics
* Respect existing decisions unless harmful

---

## Final Guideline

> The best architecture change is the one you don’t have to make.

Act accordingly.
