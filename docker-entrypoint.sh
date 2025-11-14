#!/bin/sh
set -e

echo "🚀 Starting Moodle MCP Server..."

# Инициализируем БД если DATABASE_URL предоставлен
if [ -n "$DATABASE_URL" ]; then
  echo "📊 Initializing database..."
  psql "$DATABASE_URL" -f /app/db/schema.sql 2>&1 | grep -v "already exists" || true
  echo "✅ Database ready"
else
  echo "⚠️  DATABASE_URL not set, running without database"
fi

# Запускаем сервер
echo "🌐 Starting HTTP server..."
exec node build/http-server.js

