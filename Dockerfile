FROM postgres:16-bullseye

ENV GEO_VERSION=3.12.2

# Install necessary packages
RUN apt-get update && \
    apt-get install -y binutils libproj-dev gdal-bin cmake wget build-essential

# Download and extract GEOS
RUN wget https://download.osgeo.org/geos/geos-${GEO_VERSION}.tar.bz2 && \
    tar xjf geos-${GEO_VERSION}.tar.bz2

# Build and install GEOS
RUN cd geos-${GEO_VERSION} && \
    mkdir build && cd build && \
    cmake -DCMAKE_BUILD_TYPE=Release .. && \
    cmake --build . && \
    cmake --build . --target install

# Run ldconfig to update the shared library cache
RUN ldconfig

ENV POSTGIS_MAJOR 3
ENV POSTGIS_VERSION 3.4.2+dfsg-1.pgdg110+1

RUN apt-get update \
      && apt-cache showpkg postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR \
      && apt-get install -y --no-install-recommends \
           # ca-certificates: for accessing remote raster files;
           #   fix: https://github.com/postgis/docker-postgis/issues/307
           ca-certificates \
           \
           postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR=$POSTGIS_VERSION \
           postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts \
      && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /docker-entrypoint-initdb.d
COPY ./initdb-postgis.sh /docker-entrypoint-initdb.d/10_postgis.sh
COPY ./update-postgis.sh /usr/local/bin
