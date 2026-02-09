# ADR-003: macOS Application Packaging for Desktop Integration

## Status
Accepted

## Context
Diskwise is primarily a source-based CLI tool. However, for a "premium" user experience on macOS, users expect a native application entry point with a custom icon and easy access via the Dock or Applications folder.

## Decision
We decided to use an Automator-based Application wrapper (`Diskwise.app`) that executes the unified `launch_mac.command` script. This approach provides:
1.  **Custom Icons**: Support for `.icns` files via the app bundle's `Resources` folder.
2.  **Native Feel**: The ability to pin the app to the Dock.
3.  **Low Friction**: No requirement for complex binary compilation or code signing for local use.

## Consequences
- **Maintenance**: Changes to the launch sequence must be synchronized across `dev.sh`, `launch_mac.command`, and eventually the Automator wrapper if the entry point changes.
- **Icon Caching**: macOS may cache icons aggressively, requiring manual intervention (`touch` + `killall Finder`) after updating the `Info.plist`.
- **System Permissions**: The bundle requires `NSAppleEventsUsageDescription` and other permissions in `Info.plist` to run background processes and open browser windows.
