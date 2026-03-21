#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"
SOURCE_ROOT="$(pwd)"

rm -rf "Diskwise.app"
mkdir -p "Diskwise.app/Contents/MacOS" "Diskwise.app/Contents/Resources"

cat > "Diskwise.app/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>Diskwise</string>
    <key>CFBundleIconFile</key>
    <string>DiskwiseDock.png</string>
    <key>CFBundleIdentifier</key>
    <string>com.diskwise.launcher</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>Diskwise</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
</dict>
</plist>
PLIST

cat > "Diskwise.app/Contents/MacOS/Diskwise" <<'SH'
#!/bin/bash
set -euo pipefail

SOURCE_ROOT="__SOURCE_ROOT__"
APP_LOCAL_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
LAUNCH_SCRIPT=""

if [[ -x "$SOURCE_ROOT/launch_mac.command" ]]; then
  LAUNCH_SCRIPT="$SOURCE_ROOT/launch_mac.command"
elif [[ -x "$APP_LOCAL_ROOT/launch_mac.command" ]]; then
  LAUNCH_SCRIPT="$APP_LOCAL_ROOT/launch_mac.command"
fi

if [[ -z "$LAUNCH_SCRIPT" ]]; then
  osascript -e 'display alert "Diskwise launcher missing" message "Could not find launch_mac.command. Rebuild with ./make_app.sh from your current project path."'
  exit 1
fi

open -a "Terminal" "$LAUNCH_SCRIPT"
SH

sed -i '' "s|__SOURCE_ROOT__|$SOURCE_ROOT|g" "Diskwise.app/Contents/MacOS/Diskwise"
chmod +x "Diskwise.app/Contents/MacOS/Diskwise"
cp "assets/diskwise_dock_source.png" "Diskwise.app/Contents/Resources/DiskwiseDock.png"
touch "Diskwise.app"
