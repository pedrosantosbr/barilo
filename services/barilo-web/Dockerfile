FROM node:21.4.0-slim AS development

RUN apt-get update && apt-get upgrade --yes \
  # utilities
  bash curl tini

EXPOSE 3000

ENV HOSTNAME=::
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install --global bun


WORKDIR /app

COPY ./package.json .
COPY ./bun.lockb .

RUN bun install

COPY . .

CMD ["bun", "dev"]