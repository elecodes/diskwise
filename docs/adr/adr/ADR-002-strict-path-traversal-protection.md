# ADR-002: Strict Path Traversal Protection

## Status

Accepted

## Context

The **diskwise** tool performs filesystem operations on behalf of the user. To prevent accidental or malicious deletion/scanning of sensitive files, we need a robust way to ensure the tool stays within "safe" directories.

Standard filesystem paths allow for "traversal" using the `..` notation (e.g., `~/Downloads/../../etc/passwd`). If not handled, this could allow the tool to escape the user's intended scan root.

## Decision

We have implemented a strict **Path Traversal Protection** mechanism in the `infra` layer (`sanitize_path` function):

1.  **Block `..`**: Any path string containing the substring `..` is explicitly blocked and triggers a `ValueError`.
2.  **Explicit Roots**: All paths must be within a predefined list of `ALLOWED_BASE_PATHS` (typically the User Home directory and `/tmp`).
3.  **Path Resolution**: We use `Path.resolve()` to expand any symlinks or relative parts before validation, ensuring we are checking the *actual* target location.

## Consequences

- **Safety**: The tool is guaranteed to stay within user-authorized boundaries.
- **Security**: It is resilient against common path traversal attacks.
- **UX Limitation**: Users cannot use relative paths like `../` when calling the CLI. They must use absolute paths or paths starting with `~`. 
    - *Example*: Use `~/Downloads/file.txt` instead of `../file.txt`.
- **Consistency**: This rule is applied consistently across both the CLI and the REST API.

## Alternatives Considered

- **Normalizing without blocking**: We could have normalized paths to remove `..` instead of blocking them. However, explicitly blocking is more "fail-safe" and clearly communicates the security boundary to the user.
