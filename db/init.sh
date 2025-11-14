#!/bin/bash
# Скрипт для инициализации БД

set -e

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set"
    exit 1
fi

echo "Initializing database..."
psql "$DATABASE_URL" -f /app/db/schema.sql
echo "✅ Database initialized successfully"

