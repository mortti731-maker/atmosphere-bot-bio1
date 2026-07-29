# 🚀 Пошаговое руководство по развертыванию Telegram Bio Bot на Render.com

## 📋 Подготовка (5 минут)

### Шаг 1: Установите Git
Если у вас не установлен Git, скачайте и установите его:
- Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win)
- Mac: `brew install git`
- Linux: `sudo apt install git`

### Шаг 2: Создайте аккаунт на GitHub
1. Перейдите на [https://github.com](https://github.com)
2. Нажмите «Sign up»
3. Заполните форму регистрации
4. Подтвердите email

### Шаг 3: Создайте новый репозиторий
1. Нажмите «New» (зеленая кнопка)
2. Введите имя: `telegram-bio-bot`
3. Выберите «Public»
4. Нажмите «Create repository»

## 💻 Загрузка проекта на GitHub (5 минут)

### Шаг 4: Клонируйте пустой репозиторий
```bash
git clone https://github.com/yourusername/telegram-bio-bot.git
cd telegram-bio-bot
```

### Шаг 5: Скопируйте файлы проекта
Скопируйте все файлы из текущей папки в клонированный репозиторий:
- `index.js`
- `package.json`
- `public/`
- `.env`
- `README.md`
- и другие файлы

### Шаг 6: Загрузите на GitHub
```bash
git add .
git commit -m "Initial commit: Telegram Bio Bot project"
git push origin main
```

## ☁️ Развертывание на Render.com (10 минут)

### Шаг 7: Создайте аккаунт на Render
1. Перейдите на [https://render.com](https://render.com)
2. Нажмите «Sign Up»
3. Выберите «Continue with GitHub»
4. Авторизуйтесь через GitHub

### Шаг 8: Создайте новый Web Service
1. Нажмите «New» → «Web Service»
2. Выберите ваш репозиторий `telegram-bio-bot`
3. Нажмите «Connect»

### Шаг 9: Настройте сервис

**Основные настройки:**
- **Name**: `telegram-bio-bot`
- **Region**: Выберите ближайший (например, `Frankfurt (EU Central)`)
- **Branch**: `main`
- **Root Directory**: (оставить пустым)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Переменные окружения (Environment Variables):**
Нажмите «Add Environment Variable» и добавьте:

| Key              | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| TELEGRAM_TOKEN   | `8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc`                    |
| DOMAIN           | `telegram-bio-bot.onrender.com` (измените после развертывания)       |
| USE_WEBHOOK      | `true`                                                                |
| WEBHOOK_URL      | `https://telegram-bio-bot.onrender.com/webhook` (измените после)     |

### Шаг 10: Выберите план и разверните
1. Выберите «Free» план
2. Нажмите «Create Web Service»
3. Дождитесь завершения развертывания (2-5 минут)

## 🔧 Настройка Telegram вебхука (3 минуты)

### Шаг 11: Получите URL вашего сервера
1. После развертывания откройте ваш сервис на Render
2. Скопируйте URL (будет вида `https://telegram-bio-bot.onrender.com`)

### Шаг 12: Обновите переменные окружения
1. Вернитесь в настройки сервиса на Render
2. Обновите переменные:
   - `DOMAIN` = `telegram-bio-bot.onrender.com` (ваш реальный домен)
   - `WEBHOOK_URL` = `https://telegram-bio-bot.onrender.com/webhook`

### Шаг 13: Настройте вебхук
Откройте в браузере:
```
https://api.telegram.org/bot8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc/setWebhook?url=https://telegram-bio-bot.onrender.com/webhook
```

Или выполните в терминале:
```bash
curl -X POST "https://api.telegram.org/bot8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc/setWebhook?url=https://telegram-bio-bot.onrender.com/webhook"
```

## ✅ Тестирование (2 минуты)

### Шаг 14: Проверьте работу бота
1. Откройте Telegram
2. Найдите вашего бота по токену или имени
3. Отправьте команду `/start`
4. Следуйте инструкциям для создания био-страницы

### Шаг 15: Проверьте био-страницу
1. После создания био-страницы используйте команду `/mybio`
2. Откройте полученную ссылку в браузере
3. Убедитесь, что все анимации работают

## ❗ Решение проблем

### Проблема 1: Бот не отвечает
**Решение:**
1. Проверьте логи на Render.com
2. Убедитесь, что вебхук настроен правильно
3. Проверьте токен бота

### Проблема 2: Страница не открывается
**Решение:**
1. Проверьте URL в браузере
2. Убедитесь, что сервис на Render работает
3. Проверьте переменные окружения

### Проблема 3: Анимации не работают
**Решение:**
1. Откройте консоль браузера (F12)
2. Проверьте ошибки загрузки файлов
3. Убедитесь, что все статические файлы загружены

## 🎉 Готово!

После выполнения всех шагов у вас будет:
- ✅ Работающий Telegram бот 24/7
- ✅ Красивые био-страницы с анимациями
- ✅ Возможность делиться ссылками
- ✅ Полностью бесплатный хостинг

## 📌 Дополнительные советы

1. **Для постоянной работы**: Бесплатный план Render может «засыпать» после 15 минут бездействия. Для постоянной работы рассмотрите платный план.

2. **Хранение данных**: В текущей реализации данные хранятся в памяти. Для production добавьте базу данных (MongoDB, PostgreSQL).

3. **Безопасность**: Не делитесь своим токеном бота. Храните его в секрете.

4. **Обновления**: Для обновления бота просто пушьте изменения в репозиторий - Render автоматически развернет их.

## 🔗 Полезные ссылки

- [Render.com Documentation](https://render.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Node.js на Render](https://render.com/docs/deploy-node-express-app)

Если у вас возникнут вопросы на любом этапе, вы можете обратиться к документации или задать вопрос в сообществе Render!