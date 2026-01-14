#!/bin/bash

# Kill Ports and Start Servers Script for Soudanco V4
# This script kills all processes using ports needed by the application and starts both servers

echo "🛑 Stopping all Soudanco V4 services..."

# Kill all potential ports used by the apps
# Admin Panel: 3000-3004
# User App: 3001-3002
# Note: Port 5433 (PostgreSQL) is not killed - database should stay running

ports=(3000 3001 3002 3003 3004)

for port in "${ports[@]}"; do
  if lsof -ti :$port > /dev/null 2>&1; then
    echo "  Killing processes on port $port..."
    lsof -ti :$port | xargs kill -9 2>/dev/null
  fi
done

echo "✅ All ports cleared!"
echo ""
echo "� Checking Docker and Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "  Starting Docker Desktop..."
  open -a Docker
  echo "  Waiting for Docker to start (this may take 20-30 seconds)..."
  
  # Wait for Docker to be ready (max 60 seconds)
  for i in {1..60}; do
    if docker info > /dev/null 2>&1; then
      echo "  Docker is ready!"
      break
    fi
    sleep 1
    if [ $i -eq 60 ]; then
      echo "  ❌ Docker failed to start in time. Please start Docker manually."
      exit 1
    fi
  done
else
  echo "  Docker is already running ✓"
fi

# Start PostgreSQL database
echo "  Starting PostgreSQL database..."
cd "$SCRIPT_DIR" && docker-compose up -d > /dev/null 2>&1
sleep 2
echo "  Database ready ✓"

echo ""
echo "�🚀 Starting servers..."
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start Admin Panel
echo "📊 Starting Admin Panel..."
cd "$SCRIPT_DIR/admin-panel" && npm run dev > /tmp/admin-panel.log 2>&1 &
ADMIN_PID=$!
echo "  Admin Panel PID: $ADMIN_PID"

# Start User App
echo "👤 Starting User App..."
cd "$SCRIPT_DIR/user-app" && npm run dev > /tmp/user-app.log 2>&1 &
USER_PID=$!
echo "  User App PID: $USER_PID"

echo ""
echo "⏳ Waiting for servers to start..."
sleep 8

echo ""
echo "✅ Servers started!"
echo ""
echo "📊 Admin Panel:"
tail -10 /tmp/admin-panel.log | grep -E "Local:|ready"
echo ""
echo "👤 User App:"
tail -10 /tmp/user-app.log | grep -E "Local:|ready"
echo ""
echo "📝 Logs:"
echo "  Admin Panel: /tmp/admin-panel.log"
echo "  User App:    /tmp/user-app.log"
