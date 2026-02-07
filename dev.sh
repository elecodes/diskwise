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
    exit
}

trap cleanup SIGINT

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

# Keep script running
wait
