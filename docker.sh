#!/bin/bash

set -e

COMPOSE_FILE="docker-compose.yml"
DEV_COMPOSE_FILE="docker-compose.dev.yml"

show_help() {
    cat << EOF
🐳 Skywalk Docker Management Script

Usage: ./docker.sh [command]

Commands:
    start               Start all services (production mode)
    start-dev           Start all services (development mode)
    stop                Stop all services
    restart             Restart all services
    rebuild             Rebuild and restart all services
    logs                Show logs from all services
    logs-backend        Show backend logs
    logs-frontend       Show frontend logs
    logs-db             Show database logs
    ps                  Show running containers
    shell-backend       Open shell in backend container
    shell-db            Open psql in database
    clean               Stop and remove all containers and volumes (⚠️  DATA LOSS)
    migration-run       Run database migrations
    migration-revert    Revert last migration
    help                Show this help message

Examples:
    ./docker.sh start
    ./docker.sh logs-backend
    ./docker.sh shell-backend

EOF
}

case "$1" in
    start)
        echo "🚀 Starting Skywalk in production mode..."
        docker-compose -f $COMPOSE_FILE up -d
        echo "✅ Services started!"
        echo "   Frontend: http://localhost"
        echo "   Backend:  http://localhost:3000"
        ;;
    
    start-dev)
        echo "🚀 Starting Skywalk in development mode..."
        docker-compose -f $DEV_COMPOSE_FILE up -d
        echo "✅ Services started!"
        echo "   Backend: http://localhost:3000"
        echo "   Database: localhost:5432"
        echo ""
        echo "⚠️  Note: Run frontend with 'npm run dev' in skywalk-frontend/"
        ;;
    
    stop)
        echo "🛑 Stopping all services..."
        docker-compose -f $COMPOSE_FILE down
        docker-compose -f $DEV_COMPOSE_FILE down 2>/dev/null || true
        echo "✅ Services stopped!"
        ;;
    
    restart)
        echo "🔄 Restarting all services..."
        docker-compose -f $COMPOSE_FILE restart
        echo "✅ Services restarted!"
        ;;
    
    rebuild)
        echo "🔨 Rebuilding and restarting services..."
        docker-compose -f $COMPOSE_FILE up -d --build
        echo "✅ Services rebuilt and started!"
        ;;
    
    logs)
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    
    logs-backend)
        docker-compose -f $COMPOSE_FILE logs -f backend
        ;;
    
    logs-frontend)
        docker-compose -f $COMPOSE_FILE logs -f frontend
        ;;
    
    logs-db)
        docker-compose -f $COMPOSE_FILE logs -f db
        ;;
    
    ps)
        echo "📊 Running containers:"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    
    shell-backend)
        echo "🐚 Opening shell in backend container..."
        docker-compose -f $COMPOSE_FILE exec backend sh
        ;;
    
    shell-db)
        echo "🐘 Opening psql in database..."
        docker-compose -f $COMPOSE_FILE exec db psql -U skywalk_user -d skywalk_db
        ;;
    
    clean)
        echo "⚠️  This will DELETE all containers and volumes!"
        read -p "Are you sure? (yes/no) " -n 3 -r
        echo
        if [[ $REPLY =~ ^yes$ ]]; then
            echo "🧹 Cleaning up..."
            docker-compose -f $COMPOSE_FILE down -v
            docker-compose -f $DEV_COMPOSE_FILE down -v 2>/dev/null || true
            echo "✅ Cleanup complete!"
        else
            echo "❌ Cancelled"
        fi
        ;;
    
    migration-run)
        echo "🔄 Running migrations..."
        docker-compose -f $COMPOSE_FILE exec backend npm run migration:run
        echo "✅ Migrations complete!"
        ;;
    
    migration-revert)
        echo "⏪ Reverting last migration..."
        docker-compose -f $COMPOSE_FILE exec backend npm run migration:revert
        echo "✅ Migration reverted!"
        ;;
    
    help|"")
        show_help
        ;;
    
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
