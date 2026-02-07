#!/bin/bash

# colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting DiskWise Developer Environment...${NC}"

# Function to kill all background processes on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down...${NC}"
    kill $BACKEND_PID
    kill $FRONTEND_PID
}

# Port cleanup function
cleanup_ports() {
    echo "Cleaning up ports 8000, 5173, 5174..."
    lsof -ti:8000,5173,5174 | xargs kill -9 2>/dev/null || true
}

# Trap SIGINT (Ctrl+C)
trap "cleanup; cleanup_ports; exit" SIGINT

# Kill existing processes before starting
cleanup_ports

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Install Python dependencies if needed
echo -e "${GREEN}Checking Python dependencies...${NC}"
pip install -r ./requirements.txt --quiet

# Start Backend API
echo -e "${GREEN}Starting Backend API (FastAPI)...${NC}"
cd "$ROOT_DIR"
export PYTHONPATH="$PYTHONPATH:$ROOT_DIR/diskwise"
python3 diskwise/api/main.py &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Start Frontend Dev Server
echo -e "${GREEN}Starting Frontend Dashboard (Vite)...${NC}"
cd "$ROOT_DIR/app"
npm run dev &
FRONTEND_PID=$!

echo -e "${BLUE}Both services are running!${NC}"
echo -e "Backend: http://localhost:8000"
echo -e "Frontend: http://localhost:5173"
echo -e "\n${BLUE}To use the CLI in another terminal:${NC}"
echo -e "  export PYTHONPATH=\"\$PYTHONPATH:\$ROOT_DIR/diskwise\""
echo -e "  python3 diskwise/cli/main.py scan ~/Downloads"
echo -e "  python3 diskwise/cli/main.py delete ~/Downloads/temp.txt"

# Keep script running
wait
