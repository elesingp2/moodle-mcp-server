#!/bin/sh
set -e

echo "🚀 Starting Moodle MCP Server..."

# Собираем DATABASE_URL из компонентов Railway если нужно
if [ -z "$DATABASE_URL" ] && [ -n "$POSTGRES_HOST" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-railway}"
  echo "📊 Built DATABASE_URL from Railway components"
fi

echo "📋 Environment check:"
echo "  DATABASE_URL: ${DATABASE_URL:0:30}..."

# Инициализируем БД если DATABASE_URL предоставлен
if [ -n "$DATABASE_URL" ]; then
  echo "📊 Initializing database..."
  
  # Пробуем подключиться
  if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Database connection OK"
    psql "$DATABASE_URL" -f /app/db/schema.sql 2>&1 | grep -v "already exists" || true
    echo "✅ Database schema ready"
  else
    echo "❌ Cannot connect to database, continuing without DB..."
  fi
else
  echo "⚠️  DATABASE_URL not set, running without database"
fi

# Запускаем сервер
echo "🌐 Starting HTTP server..."
exec node build/http-server.js

