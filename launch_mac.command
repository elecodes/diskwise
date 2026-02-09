#!/bin/bash
# Set working directory to the script's folder
cd "$(dirname "$0")"
ROOT_DIR="$(pwd)"

# Ensure common brew/local paths are in the PATH
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:$PATH"

echo "Starting Diskwise in $ROOT_DIR..."

# Cleanup old processes
echo "Cleaning up ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Set PYTHONPATH explicitly with quotes
export PYTHONPATH="${ROOT_DIR}:${ROOT_DIR}/diskwise"

# Start Backend API in background
python3 "${ROOT_DIR}/diskwise/api/main.py" &
BACKEND_PID=$!

# Wait for backend
sleep 2

# Start Frontend and open browser
cd app
npm run dev -- --open &
FRONTEND_PID=$!

echo "Diskwise is running!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Function to handle script termination
cleanup() {
    echo "Shutting down Diskwise..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Keep the terminal open
wait
