# Railway Deploy

## Быстрый деплой

1. **Push в GitHub:**
```bash
git add .
git commit -m "готов к деплою"
git push
```

2. **Railway:**
   - Зайди на [railway.app](https://railway.app)
   - New Project → Deploy from GitHub repo
   - Выбери `moodle-mcp-server`

3. **Environment Variables:**
   Добавь в Railway:
   ```
   MOODLE_API_URL=https://moodle.org/webservice/rest/server.php
   MOODLE_API_TOKEN=9d96a3002ad121e551d55def06ff09bf
   MOODLE_COURSE_ID=1
   ```

4. **Deploy** - Railway автоматически соберет и запустит

## Проверка
После деплоя Railway выдаст URL типа `your-app.railway.app`

Готово! 🚀

