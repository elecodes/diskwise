#!/bin/bash
set -euo pipefail
# Set working directory to the script's folder
cd "$(dirname "$0")"
ROOT_DIR="$(pwd)"

# Ensure common brew/local paths are in the PATH
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:$PATH"

echo "Starting Diskwise in $ROOT_DIR..."

# Cleanup old processes
echo "Cleaning up ports..."
PIDS_8000="$(lsof -ti:8000 2>/dev/null || true)"
PIDS_5173="$(lsof -ti:5173 2>/dev/null || true)"
if [ -n "$PIDS_8000" ]; then
    echo "$PIDS_8000" | xargs kill -9 2>/dev/null || true
fi
if [ -n "$PIDS_5173" ]; then
    echo "$PIDS_5173" | xargs kill -9 2>/dev/null || true
fi

# Set PYTHONPATH explicitly with quotes
export PYTHONPATH="${ROOT_DIR}:${ROOT_DIR}/diskwise"

# Start Backend API in background
python3 -m uvicorn diskwise.api.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait for backend to become responsive
echo "Waiting for backend on http://127.0.0.1:8000 ..."
for _ in {1..30}; do
    if curl -sf "http://127.0.0.1:8000/" >/dev/null 2>&1; then
        echo "Backend is ready."
        break
    fi
    sleep 1
done

if ! curl -sf "http://127.0.0.1:8000/" >/dev/null 2>&1; then
    echo "Backend failed to become ready. Stopping startup."
    kill "$BACKEND_PID" 2>/dev/null || true
    exit 1
fi

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
