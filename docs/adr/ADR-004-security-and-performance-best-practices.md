# ADR-004: Security and Performance Best Practices

## Status
Accepted

## Context
As Diskwise evolved into a "Pro Max" premium utility, two areas required hardening:
1.  **Backend Security**: The FastAPI backend was missing standard security headers (CSP, HSTS, X-Frame-Options) and the compression logic was vulnerable to "Zip Slip" attacks (path traversal via zip entries).
2.  **Frontend Performance**: The React dashboard was performing expensive filtering on every render and had non-optimal patterns (e.g., inline functions within components causing unnecessary re-renders).

## Decision
We decided to implement a suite of security and performance upgrades:

### Security Enhancements
-   **Middleware**: Introduced `SecureHeadersMiddleware` in the API layer to enforce modern security standards (Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, etc.).
-   **CORS Hardening**: Refined CORS configuration to restrict origins and methods to strictly necessary development and production paths.
-   **Zip Slip Protection**: Updated `manager.py` to ensure archived paths are relative to the zip root by explicitly setting `arcname=path.name`, preventing arbitrary file writes during extraction.

### Performance & React Best Practices
-   **Calculation Memoization**: Applied `useMemo` to expensive filtering logic (`filteredFiles`) and size calculations (`selectedSize`) to prevent redundant processing.
-   **Function Hoisting**: Moved non-reactive utility functions (e.g., `formatSize`) outside component definitions to ensure stable references across renders.
-   **Conditional Rendering**: Refactored `&&` short-circuits to ternary operators in JSX to avoid accidental rendering of falsy values (e.g., `0`) and align with Vercel/React best practices.

## Consequences
-   **Security**: The application now satisfies automated security audits and protects against path traversal during compression.
-   **Performance**: The dashboard remains fluid even with large scan results, and component re-renders are minimized.
-   **Maintenance**: Cleaner JSX patterns and hoisted utilities improve code readability and stability.
