#!/bin/bash

set -Eeuo pipefail

function main() (
  dev_poetry_install

  echo "Waiting for postgres..."

  ./wait_for_postgres.py

  command="${1:-}"

  case "$command" in

    "runsetup")
      run_setup
      ;;

    "runconsumer")
      python3 manage.py start_rabbitmq_consumer
      ;;
    
    "") ;;

    *)
      # shellcheck disable=SC2068
      python3 manage.py $@
      exit 1
      ;;
  esac
)

function dev_poetry_install() (
  set -x
  poetry install --sync --no-root
)

function run_setup() (
  printf "\n\n"
  echo "Creating migrations..."
  echo "====================="
  python3 manage.py makemigrations

  printf "\n\n"
  echo "Running migrations..."
  echo "====================="
  python3 manage.py migrate
  echo "Done!"

  # printf "\n\n"
  # echo "Seeding database..."
  # echo "====================="
  # ./bin/seed_database.py
  # echo "Done!"

  printf "\n\n"
  echo "Running server..."
  echo "====================="
  python3 manage.py runserver 0.0.0.0:8000
)

function run_grpc_server() {
  python3 manage.py rungrpc
}
main $@
