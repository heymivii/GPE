#!/bin/bash

echo "🧪 Skywalk Docker Health Check"
echo "==============================="
echo ""

check_service() {
    local service=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $service... "
    
    response=$(curl -s -w "%{http_code}" "$url" -o /tmp/response.txt)
    
    if [ "$response" = "$expected" ]; then
        echo "✅ OK (HTTP $response)"
        return 0
    else
        echo "❌ FAILED (HTTP $response)"
        cat /tmp/response.txt
        echo ""
        return 1
    fi
}

check_docker_running() {
    echo -n "Checking if Docker is running... "
    if docker info > /dev/null 2>&1; then
        echo "✅ OK"
        return 0
    else
        echo "❌ Docker is not running"
        echo "Please start Docker Desktop and try again"
        exit 1
    fi
}

check_containers() {
    echo ""
    echo "📦 Container Status:"
    docker-compose ps
    echo ""
}

echo "Step 1: Docker Engine"
check_docker_running

echo ""
echo "Step 2: Containers"
check_containers

echo "Step 3: Health Checks"
echo "Waiting 5 seconds for services to be ready..."
sleep 5
echo ""

check_service "Backend Health" "http://localhost:3000/health" "200"
check_service "Frontend" "http://localhost/" "200"
check_service "Backend API" "http://localhost:3000" "200"

echo ""
echo "Step 4: Database Connection"
echo -n "Testing database connection... "
docker-compose exec -T db pg_isready -U skywalk_user > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo ""
echo "==============================="
echo "🎉 Health check complete!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost"
echo "  Backend:  http://localhost:3000"
echo "  API Docs: http://localhost:3000/api"
echo ""
