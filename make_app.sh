#!/bin/bash
cat << 'AS' > launcher.applescript
tell application "Terminal"
    do script "\"/Users/elena/Developer/Diskwise_CLI /launch_mac.command\""
    activate
end tell
AS

osacompile -o Diskwise.app launcher.applescript
cp assets/Diskwise.icns Diskwise.app/Contents/Resources/applet.icns
# Update timestamp to refresh icon cache
touch Diskwise.app
rm launcher.applescript
