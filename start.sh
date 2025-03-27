#!/bin/bash

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}Starting Spotopia - Music Recommendation App${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if Docker is installed and running
if ! command -v docker &> /dev/null || ! docker info &> /dev/null; then
    echo -e "${YELLOW}Docker is not running or not installed.${NC}"
    echo "Starting services manually..."

    # Start backend
    echo -e "${GREEN}Starting FastAPI backend...${NC}"
    cd backend
    # Create a Python virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python -m venv venv
    fi
    # Activate the virtual environment
    source venv/bin/activate
    # Install dependencies if needed
    pip install -r requirements.txt
    # Start the backend in the background
    uvicorn app:app --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo -e "${GREEN}Backend started with PID: $BACKEND_PID${NC}"
    cd ..

    # Start frontend
    echo -e "${GREEN}Starting React frontend...${NC}"
    cd spotopia
    # Install dependencies if needed
    npm install
    # Start the frontend in the background
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"
    cd ..

    echo -e "${BLUE}=======================================${NC}"
    echo -e "${GREEN}Spotopia is running!${NC}"
    echo -e "${YELLOW}Frontend:${NC} http://localhost:5173"
    echo -e "${YELLOW}Backend:${NC} http://localhost:8000"
    echo -e "${BLUE}=======================================${NC}"

    # Setup cleanup on script exit
    trap "echo 'Shutting down services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

    # Wait for user to press Ctrl+C
    echo "Press Ctrl+C to stop all services..."
    wait

else
    # Use Docker Compose
    echo -e "${GREEN}Starting services with Docker Compose...${NC}"
    
    # Start the backend services
    echo -e "${GREEN}Starting backend services...${NC}"
    cd backend
    docker-compose up -d
    cd ..
    
    # Start frontend
    echo -e "${GREEN}Starting frontend...${NC}"
    cd spotopia
    npm install
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${GREEN}Spotopia is running!${NC}"
    echo -e "${YELLOW}Frontend:${NC} http://localhost:5173"
    echo -e "${YELLOW}Backend:${NC} http://localhost:8000"
    echo -e "${BLUE}=======================================${NC}"
    
    # Setup cleanup for frontend
    trap "echo 'Shutting down services...'; kill $FRONTEND_PID; cd backend && docker-compose down; exit" INT TERM EXIT
    
    # Wait for user to press Ctrl+C
    echo "Press Ctrl+C to stop all services..."
    wait
fi