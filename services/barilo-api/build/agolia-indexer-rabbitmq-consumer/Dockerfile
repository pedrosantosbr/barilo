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

RUN apt-get update && \
    apt-get install -y binutils libproj-dev gdal-bin cmake wget build-essential

# ENV GEO_VERSION=3.12.2

# RUN apt-get update && \
#     apt-get install -y binutils libproj-dev gdal-bin cmake wget build-essential

# # Download and extract GEOS
# RUN wget https://download.osgeo.org/geos/geos-${GEO_VERSION}.tar.bz2 && \
#     tar xjf geos-${GEO_VERSION}.tar.bz2

# # Build and install GEOS
# RUN cd geos-${GEO_VERSION} && \
#     mkdir build && cd build && \
#     cmake -DCMAKE_BUILD_TYPE=Release .. && \
#     cmake --build . && \
#     cmake --build . --target install

# RUN ldconfig
  

# -------------------------------------------------------------------------------
# Used for development in docker-compose
FROM base as local

WORKDIR /src/

# CMD ["tail", "-f", "/dev/null"]

ENV \
  PATH=/src/.venv/bin:${PATH} \
  GIT_COMMIT=dev \
  PIP_NO_CACHE_DIR=off \
  GUNICORN_RELOAD=true

RUN ln -s /src/static /static

COPY ./services/barilo-api/pyproject.toml ./services/barilo-api/poetry.lock /src/

ENTRYPOINT ["./docker-entry.sh", "start_agolia_indexer_rabbitmq_consumer"]

COPY ./services/barilo-api .
COPY lib/python /lib/python

RUN chmod +x ./docker-entry.sh

# -------------------------------------------------------------------------------
# Used for development in Tilt


# -------------------------------------------------------------------------------
# Runtime prod/stage/etc
