#!/bin/bash
# Script to create a desktop alias for Diskwise on macOS

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DESKTOP_DIR="$HOME/Desktop"
SHORTCUT_PATH="$DESKTOP_DIR/Diskwise.command"

echo "Creating desktop shortcut..."

# Create a wrapper script on the desktop that points to the main launcher
cat <<EOF > "$SHORTCUT_PATH"
#!/bin/bash
cd "$ROOT_DIR"
./launch_mac.command
EOF

chmod +x "$SHORTCUT_PATH"
chmod +x "$ROOT_DIR/launch_mac.command"

echo "Shortcut created on Desktop: $SHORTCUT_PATH"
echo "You can now launch Diskwise by double-clicking the 'Diskwise' icon on your desktop."
