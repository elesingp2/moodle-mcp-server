#!/bin/sh
set -e

[ -z "$DATABASE_URL" ] && [ -n "$POSTGRES_HOST" ] && \
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-railway}"

exec node build/http-server.js

