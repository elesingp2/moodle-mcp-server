# База данных - Инструкция по развертыванию

## Автоматическая инициализация

БД **автоматически инициализируется** при старте контейнера через `docker-entrypoint.sh`!

Просто добавь PostgreSQL plugin в Railway и установи переменную окружения:

```
DATABASE_URL=postgresql://...
```

Railway автоматически предоставит `DATABASE_URL` при подключении PostgreSQL.

## Ручная инициализация (если нужно)

Если хочешь вручную:

```bash
railway ssh --project=4b4e1677-b339-4e22-845c-af251627e972 \
  --environment=6cb70854-70b6-4a4a-a74f-72a20fa91a36 \
  --service=9a28b42d-ffaf-40ff-a71f-5bc74b8d0552

psql $DATABASE_URL -f /app/db/schema.sql
```

## Структура таблицы

```sql
moodle_users:
  - id (PRIMARY KEY)
  - agent_id (UNIQUE, indexed)
  - moodle_api_url
  - moodle_api_token
  - moodle_course_id
  - created_at
  - updated_at
```

## Добавление нового пользователя

```sql
INSERT INTO moodle_users (agent_id, moodle_api_url, moodle_api_token, moodle_course_id)
VALUES (
    'agent-xxx-xxx',
    'https://moodle.org/webservice/rest/server.php',
    'your_token',
    '1'
);
```

## Проверка

```sql
SELECT * FROM moodle_users;
```

## Railway Environment Variables

В Railway нужно добавить:

```
DATABASE_URL=postgresql://...
```

(Railway автоматически предоставит это если добавить PostgreSQL плагин)

