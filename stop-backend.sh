#!/bin/bash

echo "🛑 Shutting down all TrajectoryAI services..."

# Kill all Spring Boot / Maven processes
pkill -f "spring-boot"

# Kill the Python FastAPI process
pkill -f "uvicorn app:app"

echo "✅ All services successfully stopped."