#!/usr/bin/env bash
# 🐳 Docker Development Helper Script
#
# Convenient commands for working with Docker Compose during development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
INFO="ℹ️"
WARN="⚠️"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Function to print colored messages
print_info() {
    echo -e "${CYAN}${INFO} $1${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARN} $1${NC}"
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found!"
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_success ".env file created! Please configure your API keys."
        return 1
    fi
    return 0
}

# Start services
start() {
    print_info "Starting Codex7 services..."
    check_env || exit 1

    if [ "$1" == "tools" ]; then
        print_info "Starting with admin tools (pgAdmin, Redis Commander)..."
        docker-compose --profile tools up -d
    else
        docker-compose up -d
    fi

    print_success "Services started!"
    print_info "Run './scripts/docker-dev.sh logs' to view logs"
    print_info "Run './scripts/docker-dev.sh ps' to view service status"
}

# Stop services
stop() {
    print_info "Stopping Codex7 services..."
    docker-compose down
    print_success "Services stopped!"
}

# Restart services
restart() {
    print_info "Restarting Codex7 services..."
    docker-compose restart
    print_success "Services restarted!"
}

# View logs
logs() {
    if [ -n "$1" ]; then
        docker-compose logs -f "$1"
    else
        docker-compose logs -f
    fi
}

# Show service status
ps() {
    docker-compose ps
}

# Build services
build() {
    print_info "Building Codex7 services..."
    if [ -n "$1" ]; then
        docker-compose build "$1"
        print_success "Service $1 built!"
    else
        docker-compose build
        print_success "All services built!"
    fi
}

# Execute command in service
exec_service() {
    if [ -z "$1" ]; then
        print_error "Usage: $0 exec <service> <command>"
        exit 1
    fi

    service="$1"
    shift
    docker-compose exec "$service" "$@"
}

# Run database migrations
migrate() {
    print_info "Running database migrations..."
    docker-compose exec -T postgres psql -U codex7 -d codex7 < ./migrations/001_initial.sql
    print_success "Migrations complete!"
}

# Seed database
seed() {
    print_info "Seeding database..."
    docker-compose exec indexer pnpm seed
    print_success "Database seeded!"
}

# Clean up everything
clean() {
    print_warning "This will remove all containers, volumes, and data!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup complete!"
    else
        print_info "Cancelled"
    fi
}

# Health check
health() {
    print_info "Checking service health..."

    # Check Postgres
    if docker-compose exec -T postgres pg_isready -U codex7 > /dev/null 2>&1; then
        print_success "PostgreSQL: Healthy"
    else
        print_error "PostgreSQL: Unhealthy"
    fi

    # Check Redis
    if docker-compose exec -T redis redis-cli --raw incr ping > /dev/null 2>&1; then
        print_success "Redis: Healthy"
    else
        print_error "Redis: Unhealthy"
    fi
}

# Show help
show_help() {
    cat << EOF
${ROCKET} Codex7 Docker Development Helper

Usage: $0 <command> [options]

Commands:
  start [tools]    Start all services (add 'tools' for admin UIs)
  stop             Stop all services
  restart          Restart all services
  logs [service]   View logs (all services or specific service)
  ps               Show service status
  build [service]  Build services (all or specific)
  exec <service>   Execute command in service
  migrate          Run database migrations
  seed             Seed database with initial data
  health           Check service health
  clean            Remove all containers and volumes
  help             Show this help message

Examples:
  $0 start                  # Start core services
  $0 start tools            # Start with admin tools
  $0 logs api               # View API logs
  $0 exec postgres psql     # Connect to database
  $0 build mcp-server       # Rebuild MCP server

Services:
  - postgres        PostgreSQL with pgvector
  - redis          Redis for caching and queues
  - mcp-server     Model Context Protocol server
  - api            REST API
  - indexer        Document indexer
  - web            Web UI
  - pgadmin        (tools profile) PostgreSQL admin UI
  - redis-commander (tools profile) Redis admin UI

EOF
}

# Main command handler
case "$1" in
    start)
        start "$2"
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$2"
        ;;
    ps)
        ps
        ;;
    build)
        build "$2"
        ;;
    exec)
        shift
        exec_service "$@"
        ;;
    migrate)
        migrate
        ;;
    seed)
        seed
        ;;
    health)
        health
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            show_help
        else
            print_error "Unknown command: $1"
            show_help
            exit 1
        fi
        ;;
esac
