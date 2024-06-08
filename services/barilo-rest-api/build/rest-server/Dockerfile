FROM python:3.11.7-bullseye as base

RUN apt-get update && apt-get upgrade --yes postgresql-client

ENV \
  PIP_DEFAULT_TIMEOUT=100 \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_NO_CACHE_DIR=on \
  POETRY_HOME=/usr/local/bin \
  POETRY_NO_INTERACTION=true \
  POETRY_VERSION=1.7.1 \
  PYTHONDONTWRITEBYTECODE=1 \
  POETRY_VIRTUALENVS_IN_PROJECT=true \
  PROMETHEUS_MULTIPROC_DIR=/tmp/prometheus_multiproc_dir \
  PYTHONUNBUFFERED=1

RUN mkdir --mode=777 ${PROMETHEUS_MULTIPROC_DIR}

RUN pip install "poetry==${POETRY_VERSION}"

# -------------------------------------------------------------------------------
# Used for development in docker-compose
FROM base as local

WORKDIR /src/

ENV \
  PATH=/src/.venv/bin:${PATH} \
  GIT_COMMIT=dev \
  PIP_NO_CACHE_DIR=off \
  GUNICORN_RELOAD=true

RUN ln -s /src/static /static

COPY ./pyproject.toml ./poetry.lock /src/

ENTRYPOINT ["./docker-entry.sh", "runsetup"]

COPY . .

RUN chmod +x ./docker-entry.sh

# -------------------------------------------------------------------------------
# Used for development in Tilt


# -------------------------------------------------------------------------------
# Runtime prod/stage/etc
