FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Устанавливаем PostgreSQL клиент для скриптов
RUN apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

COPY --from=builder /app/build ./build
COPY db ./db
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./docker-entrypoint.sh"]

