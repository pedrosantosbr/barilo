#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && git rev-parse --show-toplevel)

COLOR_RED="\033[0;31m"
COLOR_ORANGE="\033[0;33m"
COLOR_GREEN="\033[0;32m"
COLOR_PURPLE="\033[0;35m"
COLOR_GRAY="\033[0;90m"
COLOR_NONE="\033[0m"

function info() {
  log "${COLOR_GREEN}INF${COLOR_NONE} $* $(current_command)"
}

# Use this command to install Docker engine
function docker_install() (
  if ! which docker &>/dev/null; then
    info "Installing Docker..."
    # First, update your existing list of packages:
    sudo apt update

    # Next, install a few prerequisite packages which let apt use packages over HTTPS:
    sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

    # Then add the GPG key for the official Docker repository to your system:
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Add the Docker repository to APT sources:
    sudo apt update

    # Make sure you are about to install from the Docker repo instead of the default Ubuntu repo:
    apt-cache policy docker-ce

    # Finally, install Docker:
    sudo apt install docker-ce -y

    sudo usermod -aG docker ${USER}

    su - ${USER}
  fi
  ;;
)

# Ensure docker is up running
function ensure_docker() (
  install_docker

  case $(uname -s) in
  Darwin)

    # Start Docker Desktop
    open -ga /Applications/Docker.app

    for i in {1..10}; do
      if docker ps &>/dev/null; then
        return
      fi
      info "Waiting for docker to start... (${i}/10)"
      sleep 5
    done

    error "Please ensure docker is running"

    ;;
  Linux)

    # We are assuming systemd here, does anyone run anything else?
    # start is idempotent
    # On some (most?) systemd systems interacting with docker.socket will start docker.service,
    # without needsing to use sudo, so try that and then fall back to starting the service
    docker ps &>/dev/null || sudo systemctl start docker.service

    for i in {1..10}; do

      if docker ps &>/dev/null; then
        return
      fi

      info "Waiting for docker to start... (${i}/10)"
      sleep 5
    done

    error "Please ensure docker is running"
    ;;
  esac
)

ensure_docker

docker build -t barilo-api $REPO_ROOT/services/barilo-api

docker run -d -p 8080:8080 barilo-api
