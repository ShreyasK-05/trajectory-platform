#!/bin/bash

if [ -f .env ]; then
  echo "🔐 Loading secrets from .env file..."
  set -a
  source .env
  set +a
else
  echo "⚠️ WARNING: No .env file found! Services might crash."
fi

echo "🚀 Booting TrajectoryAI Backend Stack..."

# Create a logs folder to keep your terminal clean
mkdir -p logs

# 1. Discovery Server (Must be first)
echo "1/5: Starting Discovery Server (waiting 15s for Eureka)..."
(cd discovery-server && ./mvnw spring-boot:run > ../logs/discovery.log 2>&1) &
sleep 15

# 2. Auth Service
echo "2/5: Starting Auth Service..."
(cd auth-service && ./mvnw spring-boot:run > ../logs/auth.log 2>&1) &
sleep 10

# 3. User Profile Service
echo "3/5: Starting User Profile Service..."
(cd user-profile-service && ./mvnw spring-boot:run > ../logs/profile.log 2>&1) &
sleep 10

# 4. API Gateway
echo "4/5: Starting API Gateway..."
(cd api-gateway && ./mvnw spring-boot:run > ../logs/gateway.log 2>&1) &
sleep 10

# 5. AI Inference Worker (FastAPI)
echo "5/5: Starting AI Inference Worker..."
(cd ai-inference-worker && uvicorn app:app --reload --port 8000 > ../logs/ai-inference.log 2>&1) &

echo "✅ All backend services are running in the background!"
echo "📄 You can view logs in the /logs directory."
echo "🛑 To shut everything down, type: ./stop-backend.sh"