#!/bin/bash

# Soudanco V4 Server Management CLI
# Usage: ./cli.sh [command] [options]

set -e

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# PID files
ADMIN_PID_FILE="/tmp/soudanco-admin.pid"
USER_PID_FILE="/tmp/soudanco-user.pid"

# Log files
ADMIN_LOG="/tmp/admin-panel.log"
USER_LOG="/tmp/user-app.log"

# Ports
PORTS=(3000 3001 3002 3003 3004)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_help() {
    echo "Soudanco V4 Server Management CLI"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start [service]    Start services (all|admin|user|db)"
    echo "  stop [service]     Stop services (all|admin|user|db)"
    echo "  restart [service]  Restart services (all|admin|user)"
    echo "  status             Show status of all services"
    echo "  logs [service]     Show logs (admin|user|all)"
    echo "  attach <service>   Attach to a running service (admin|user)"
    echo "  kill-ports         Kill all processes on application ports"
    echo "  help               Show this help message"
    echo ""
    echo "Options:"
    echo "  -f, --follow       Follow log output (for logs command)"
    echo "  -n, --lines <num>  Number of lines to show (default: 50)"
    echo ""
    echo "Examples:"
    echo "  $0 start           # Start all services"
    echo "  $0 start admin     # Start only admin panel"
    echo "  $0 stop            # Stop all services"
    echo "  $0 logs admin -f   # Follow admin panel logs"
    echo "  $0 attach user     # Attach to user app process"
    echo "  $0 status          # Check service status"
}

kill_ports() {
    echo -e "${YELLOW}🛑 Killing processes on application ports...${NC}"
    for port in "${PORTS[@]}"; do
        if lsof -ti :$port > /dev/null 2>&1; then
            echo "  Killing processes on port $port..."
            lsof -ti :$port | xargs kill -9 2>/dev/null || true
        fi
    done
    echo -e "${GREEN}✅ All ports cleared!${NC}"
}

ensure_docker() {
    echo -e "${BLUE}🐳 Checking Docker...${NC}"
    if ! docker info > /dev/null 2>&1; then
        echo "  Starting Docker Desktop..."
        open -a Docker
        echo "  Waiting for Docker to start (this may take 20-30 seconds)..."
        for i in {1..60}; do
            if docker info > /dev/null 2>&1; then
                echo -e "  ${GREEN}Docker is ready!${NC}"
                return 0
            fi
            sleep 1
        done
        echo -e "  ${RED}❌ Docker failed to start in time.${NC}"
        exit 1
    else
        echo -e "  ${GREEN}Docker is already running ✓${NC}"
    fi
}

start_db() {
    ensure_docker
    echo -e "${BLUE}🗄️  Starting PostgreSQL database...${NC}"
    cd "$SCRIPT_DIR" && docker-compose up -d > /dev/null 2>&1
    sleep 2
    echo -e "  ${GREEN}Database ready ✓${NC}"
}

stop_db() {
    echo -e "${YELLOW}🗄️  Stopping PostgreSQL database...${NC}"
    cd "$SCRIPT_DIR" && docker-compose down > /dev/null 2>&1 || true
    echo -e "  ${GREEN}Database stopped ✓${NC}"
}

start_admin() {
    echo -e "${BLUE}📊 Starting Admin Panel...${NC}"
    if [ -f "$ADMIN_PID_FILE" ] && kill -0 $(cat "$ADMIN_PID_FILE") 2>/dev/null; then
        echo -e "  ${YELLOW}Admin Panel is already running (PID: $(cat $ADMIN_PID_FILE))${NC}"
        return
    fi
    cd "$SCRIPT_DIR/admin-panel" && npm run dev > "$ADMIN_LOG" 2>&1 &
    echo $! > "$ADMIN_PID_FILE"
    echo -e "  ${GREEN}Admin Panel started (PID: $(cat $ADMIN_PID_FILE))${NC}"
}

start_user() {
    echo -e "${BLUE}👤 Starting User App...${NC}"
    if [ -f "$USER_PID_FILE" ] && kill -0 $(cat "$USER_PID_FILE") 2>/dev/null; then
        echo -e "  ${YELLOW}User App is already running (PID: $(cat $USER_PID_FILE))${NC}"
        return
    fi
    cd "$SCRIPT_DIR/user-app" && npm run dev > "$USER_LOG" 2>&1 &
    echo $! > "$USER_PID_FILE"
    echo -e "  ${GREEN}User App started (PID: $(cat $USER_PID_FILE))${NC}"
}

stop_admin() {
    echo -e "${YELLOW}📊 Stopping Admin Panel...${NC}"
    if [ -f "$ADMIN_PID_FILE" ]; then
        kill $(cat "$ADMIN_PID_FILE") 2>/dev/null || true
        rm -f "$ADMIN_PID_FILE"
    fi
    # Also kill any process on typical admin ports
    for port in 3000 3003 3004; do
        lsof -ti :$port 2>/dev/null | xargs kill -9 2>/dev/null || true
    done
    echo -e "  ${GREEN}Admin Panel stopped ✓${NC}"
}

stop_user() {
    echo -e "${YELLOW}👤 Stopping User App...${NC}"
    if [ -f "$USER_PID_FILE" ]; then
        kill $(cat "$USER_PID_FILE") 2>/dev/null || true
        rm -f "$USER_PID_FILE"
    fi
    # Also kill any process on typical user ports
    for port in 3001 3002; do
        lsof -ti :$port 2>/dev/null | xargs kill -9 2>/dev/null || true
    done
    echo -e "  ${GREEN}User App stopped ✓${NC}"
}

show_status() {
    echo -e "${BLUE}📊 Soudanco V4 Service Status${NC}"
    echo ""
    
    # Admin Panel
    if [ -f "$ADMIN_PID_FILE" ] && kill -0 $(cat "$ADMIN_PID_FILE") 2>/dev/null; then
        echo -e "  Admin Panel:  ${GREEN}● Running${NC} (PID: $(cat $ADMIN_PID_FILE))"
    else
        echo -e "  Admin Panel:  ${RED}○ Stopped${NC}"
    fi
    
    # User App
    if [ -f "$USER_PID_FILE" ] && kill -0 $(cat "$USER_PID_FILE") 2>/dev/null; then
        echo -e "  User App:     ${GREEN}● Running${NC} (PID: $(cat $USER_PID_FILE))"
    else
        echo -e "  User App:     ${RED}○ Stopped${NC}"
    fi
    
    # Docker/Database
    if docker info > /dev/null 2>&1; then
        if docker-compose -f "$SCRIPT_DIR/docker-compose.yml" ps 2>/dev/null | grep -q "Up"; then
            echo -e "  Database:     ${GREEN}● Running${NC}"
        else
            echo -e "  Database:     ${YELLOW}○ Docker running, DB stopped${NC}"
        fi
    else
        echo -e "  Database:     ${RED}○ Docker not running${NC}"
    fi
    
    echo ""
    echo "Port usage:"
    for port in "${PORTS[@]}"; do
        if lsof -ti :$port > /dev/null 2>&1; then
            echo -e "  Port $port: ${GREEN}● In use${NC}"
        else
            echo -e "  Port $port: ${RED}○ Free${NC}"
        fi
    done
}

show_logs() {
    local service="${1:-all}"
    local follow=false
    local lines=50
    
    shift || true
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--follow) follow=true; shift ;;
            -n|--lines) lines="$2"; shift 2 ;;
            *) shift ;;
        esac
    done
    
    case "$service" in
        admin)
            if [ -f "$ADMIN_LOG" ]; then
                if $follow; then
                    tail -f "$ADMIN_LOG"
                else
                    tail -n "$lines" "$ADMIN_LOG"
                fi
            else
                echo -e "${RED}No admin logs found${NC}"
            fi
            ;;
        user)
            if [ -f "$USER_LOG" ]; then
                if $follow; then
                    tail -f "$USER_LOG"
                else
                    tail -n "$lines" "$USER_LOG"
                fi
            else
                echo -e "${RED}No user logs found${NC}"
            fi
            ;;
        all)
            echo -e "${BLUE}=== Admin Panel Logs ===${NC}"
            [ -f "$ADMIN_LOG" ] && tail -n "$lines" "$ADMIN_LOG" || echo "No logs"
            echo ""
            echo -e "${BLUE}=== User App Logs ===${NC}"
            [ -f "$USER_LOG" ] && tail -n "$lines" "$USER_LOG" || echo "No logs"
            ;;
        *)
            echo -e "${RED}Unknown service: $service${NC}"
            echo "Use: admin, user, or all"
            exit 1
            ;;
    esac
}

attach_service() {
    local service="$1"
    
    case "$service" in
        admin)
            if [ -f "$ADMIN_LOG" ]; then
                echo -e "${BLUE}Attaching to Admin Panel (Ctrl+C to detach)...${NC}"
                tail -f "$ADMIN_LOG"
            else
                echo -e "${RED}Admin Panel is not running${NC}"
                exit 1
            fi
            ;;
        user)
            if [ -f "$USER_LOG" ]; then
                echo -e "${BLUE}Attaching to User App (Ctrl+C to detach)...${NC}"
                tail -f "$USER_LOG"
            else
                echo -e "${RED}User App is not running${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}Please specify a service: admin or user${NC}"
            exit 1
            ;;
    esac
}

# Main command handler
case "${1:-help}" in
    start)
        service="${2:-all}"
        case "$service" in
            all)
                kill_ports
                start_db
                start_admin
                start_user
                echo ""
                echo -e "${YELLOW}⏳ Waiting for servers to initialize...${NC}"
                sleep 5
                show_status
                ;;
            admin) start_admin ;;
            user) start_user ;;
            db) start_db ;;
            *) echo -e "${RED}Unknown service: $service${NC}"; exit 1 ;;
        esac
        ;;
    stop)
        service="${2:-all}"
        case "$service" in
            all)
                stop_admin
                stop_user
                stop_db
                ;;
            admin) stop_admin ;;
            user) stop_user ;;
            db) stop_db ;;
            *) echo -e "${RED}Unknown service: $service${NC}"; exit 1 ;;
        esac
        ;;
    restart)
        service="${2:-all}"
        case "$service" in
            all)
                stop_admin
                stop_user
                sleep 2
                start_admin
                start_user
                ;;
            admin) stop_admin; sleep 1; start_admin ;;
            user) stop_user; sleep 1; start_user ;;
            *) echo -e "${RED}Unknown service: $service${NC}"; exit 1 ;;
        esac
        ;;
    status)
        show_status
        ;;
    logs)
        shift
        show_logs "$@"
        ;;
    attach)
        attach_service "$2"
        ;;
    kill-ports)
        kill_ports
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
