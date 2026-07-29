# Руководство по развертыванию Telegram Bio Bot на бесплатном хостинге

## 🎯 Выбор хостинга

Для этого проекта рекомендуются следующие бесплатные хостинг-платформы:

### 1. **Render.com** (Рекомендуется)
- 🔹 Бесплатный тариф с 512MB RAM
- 🔹 Поддержка Node.js
- 🔹 Возможность постоянной работы бота
- 🔹 HTTPS из коробки
- 🔹 Простой деплой с GitHub

### 2. **Railway.app**
- 🔹 $5 бесплатного кредита в месяц
- 🔹 Отличная поддержка Node.js
- 🔹 Простая интеграция с GitHub
- 🔹 Встроенная база данных (если понадобится)

### 3. **Cyclic.sh**
- 🔹 Бесплатный хостинг для Node.js
- 🔹 Простой деплой
- 🔹 Поддержка вебхуков

## 🚀 Развертывание на Render.com (Пошаговая инструкция)

### Шаг 1: Подготовка проекта

1. **Создайте репозиторий на GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/telegram-bio-bot.git
   git push -u origin main
   ```

2. **Обновите .env файл**
   ```env
   TELEGRAM_TOKEN=8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc
   DOMAIN=your-render-domain.onrender.com
   USE_WEBHOOK=true
   WEBHOOK_URL=https://your-render-domain.onrender.com/webhook
   ```

### Шаг 2: Создание аккаунта на Render

1. Перейдите на [https://render.com](https://render.com)
2. Зарегистрируйтесь (можно через GitHub)
3. Нажмите "New" → "Web Service"

### Шаг 3: Настройка сервиса

1. **Подключите свой GitHub репозиторий**
   - Выберите репозиторий с проектом

2. **Конфигурация сервиса:**
   - **Name**: telegram-bio-bot
   - **Region**: Выберите ближайший (например, Frankfurt)
   - **Branch**: main
   - **Root Directory**: (оставить пустым)
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

3. **Переменные окружения:**
   - Добавьте все переменные из вашего .env файла
   - `TELEGRAM_TOKEN` = `8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc`
   - `DOMAIN` = `your-render-domain.onrender.com`
   - `USE_WEBHOOK` = `true`
   - `WEBHOOK_URL` = `https://your-render-domain.onrender.com/webhook`

4. **Настройки продвинутого уровня:**
   - Выберите бесплатный тариф (Free)
   - Нажмите "Create Web Service"

### Шаг 4: Настройка вебхуков для Telegram

После развертывания вам нужно настроить вебхук:

1. Откройте ваш развернутый сервер в браузере: `https://your-render-domain.onrender.com`
2. Убедитесь, что сервер работает (вы должны увидеть главную страницу)
3. Отправьте запрос на установку вебхука:

```bash
curl -F "url=https://your-render-domain.onrender.com/webhook" \
     -F "certificate=@cert.pem" \
     https://api.telegram.org/bot8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc/setWebhook
```

Или используйте браузер:
```
https://api.telegram.org/bot8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc/setWebhook?url=https://your-render-domain.onrender.com/webhook
```

### Шаг 5: Обновление кода для поддержки вебхуков

Вам нужно обновить `index.js` для поддержки вебхуков. Вот что нужно добавить:

```javascript
// В начале файла, после создания бота
if (USE_WEBHOOK && WEBHOOK_URL) {
    console.log('Настройка вебхука...');
    bot.setWebHook(WEBHOOK_URL);

    // Маршрут для вебхука
    app.use(bodyParser.json());
    app.post('/webhook', (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });

    // Маршрут для проверки вебхука
    app.get('/webhook', (req, res) => {
        res.send('Webhook is set up!');
    });
} else {
    console.log('Используется polling...');
    // Уже существующий код с polling
}
```

## 📋 Альтернативные хостинг-платформы

### Railway.app

1. Перейдите на [https://railway.app](https://railway.app)
2. Создайте новый проект → "Deploy from GitHub repo"
3. Выберите ваш репозиторий
4. Добавьте переменные окружения
5. Настройте команду запуска: `node index.js`
6. Разверните

### Cyclic.sh

1. Перейдите на [https://cyclic.sh](https://cyclic.sh)
2. Подключите GitHub аккаунт
3. Выберите репозиторий
4. Добавьте переменные окружения
5. Разверните

## ⚠️ Важные замечания

1. **Хранение данных**: В текущей реализации данные хранятся в памяти. При перезапуске сервера все био-страницы будут удалены. Для production используйте базу данных (MongoDB, PostgreSQL).

2. **Безопасность**: Не храните токен бота в коде. Всегда используйте переменные окружения.

3. **Домен**: После развертывания обновите переменную `DOMAIN` в настройках хостинга на реальный домен.

4. **HTTPS**: Все бесплатные хостинги предоставляют HTTPS автоматически.

5. **Ограничения**: Бесплатные тарифы имеют ограничения по памяти и времени работы. Для постоянной работы бота может понадобиться платный тариф.

## 🎉 Готово!

После успешного развертывания:
1. Ваш бот будет доступен 24/7
2. Пользователи смогут создавать био-страницы
3. Ссылки будут вида: `https://your-domain.com/bio/user_id`
4. Все анимации и эффекты будут работать

Если вам нужна помощь с развертыванием, я могу предоставить более детальные инструкции для конкретной платформы!