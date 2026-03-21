# ADR-003: macOS Application Packaging for Desktop Integration

## Status
Accepted

## Context
Diskwise is primarily a source-based CLI tool. However, for a "premium" user experience on macOS, users expect a native application entry point with a custom icon and easy access via the Dock or Applications folder.

## Decision
We use a script-generated native app bundle (`Diskwise.app`) created by `make_app.sh`. The bundle contains a shell launcher executable (`Contents/MacOS/Diskwise`) that opens `launch_mac.command` in Terminal, with explicit backend health checks before the frontend starts.

This approach provides:
1.  **Reliable Startup**: `launch_mac.command` starts Uvicorn directly and waits for `http://127.0.0.1:8000/` before launching Vite.
2.  **Dock Integration**: The app can be pinned to the Dock like a native app.
3.  **Low Friction**: No code signing or binary compilation required for local developer usage.
4.  **Portable Icon Source**: The Dock icon is sourced from `assets/diskwise_dock_source.png` and copied to `Contents/Resources/DiskwiseDock.png`.

## Consequences
- **Maintenance**: Changes to launch behavior must be synchronized across `dev.sh`, `launch_mac.command`, and `make_app.sh`.
- **Icon Caching**: macOS may cache icons aggressively, requiring manual intervention (`killall Dock`) and re-pinning after icon updates.
- **Bundle Regeneration**: Any launcher/icon changes require re-running `./make_app.sh` to refresh `Diskwise.app`.
