const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Загрузка переменных окружения
require('dotenv').config();

// Токен бота
const token = process.env.TELEGRAM_TOKEN || '8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc';

// Настройки сервера
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'localhost'; // Можно изменить на реальный домен
const USE_WEBHOOK = process.env.USE_WEBHOOK === 'true';
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Создаем бота с обработкой ошибок конфликта
let bot;
try {
    bot = new TelegramBot(token, {
        polling: true,
        request: {
            agent: new https.Agent({
                rejectUnauthorized: false // Для самоподписанных сертификатов
            })
        }
    });

    // Обработка ошибок конфликта
    bot.on('polling_error', (error) => {
        console.error('Polling error:', error.code);
        if (error.code === 'ETELEGRAM' && error.message.includes('terminated by other getUpdates request')) {
            console.log('Другой экземпляр бота работает. Останавливаем этот.');
            process.exit(1);
        }
    });
} catch (error) {
    console.error('Ошибка при создании бота:', error);
    process.exit(1);
}

// Создаем Express приложение
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Хранилище данных пользователей (в реальном проекте использовать базу данных)
const userData = {};

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🌟 Добро пожаловать в BioBot! 🌟\n\n' +
        'Этот бот поможет вам создать красивую био-страницу для вашего Telegram профиля.\n\n' +
        'Используйте команды:\n' +
        '/setbio - установить информацию для био-страницы\n' +
        '/mybio - получить ссылку на вашу био-страницу\n' +
        '/help - помощь');
});

// Обработчик команды /setbio
bot.onText(/\/setbio/, (msg) => {
    const chatId = msg.chat.id;
    userData[chatId] = { step: 1 };
    bot.sendMessage(chatId, '📝 Пожалуйста, отправьте текст, который вы хотите видеть на своей био-странице:');
});

// Обработчик команды /mybio
bot.onText(/\/mybio/, (msg) => {
    const chatId = msg.chat.id;
    if (userData[chatId] && userData[chatId].text) {
        const bioId = `bio_${chatId}`;
        const url = `https://${DOMAIN}/bio/${bioId}`; // Используем нормальный URL
        bot.sendMessage(chatId, `🔗 Ваша био-страница готова!\nСсылка: ${url}`);
    } else {
        bot.sendMessage(chatId, '❌ У вас еще нет био-страницы. Сначала используйте команду /setbio');
    }
});

// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '💡 Как использовать BioBot:\n\n' +
        '1. Используйте команду /setbio\n' +
        '2. Следуйте инструкциям бота\n' +
        '3. Отправьте текст для био-страницы\n' +
        '4. Отправьте фотографию для фона\n' +
        '5. Отправьте аватар (опционально)\n' +
        '6. Используйте /mybio для получения ссылки');
});

// Обработчик текстовых сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (!userData[chatId]) return;

    if (userData[chatId].step === 1) {
        // Сохраняем текст био
        userData[chatId].text = msg.text;
        userData[chatId].step = 2;
        bot.sendMessage(chatId, '✅ Текст сохранен!\n\nТеперь отправьте фотографию, которая будет фоном вашей био-страницы:');
    }
});

// Обработчик фотографий
bot.on('photo', (msg) => {
    const chatId = msg.chat.id;

    if (!userData[chatId] || userData[chatId].step !== 2) return;

    // Получаем информацию о фотографии
    const photo = msg.photo[msg.photo.length - 1];
    const fileId = photo.file_id;

    // Загружаем фотографию
    bot.getFile(fileId).then(file => {
        const filePath = file.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const localPath = path.join(__dirname, 'public', `bg_${chatId}.jpg`);

        // Сохраняем информацию о фоне
        userData[chatId].background = `/bg_${chatId}.jpg`;
        userData[chatId].step = 3;

        // Загружаем файл
        const fileStream = fs.createWriteStream(localPath);

        https.get(downloadUrl, response => {
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                bot.sendMessage(chatId, '✅ Фоновое изображение сохранено!\n\n' +
                    'Теперь отправьте аватар (круглое изображение, которое будет отображаться на странице). ' +
                    'Если не хотите добавлять аватар, отправьте команду /skipavatar');
            });
        });
    }).catch(error => {
        console.error('Ошибка при загрузке фото:', error);
        bot.sendMessage(chatId, '❌ Ошибка при загрузке фотографии. Пожалуйста, попробуйте еще раз.');
    });
});

// Обработчик команды /skipavatar
bot.onText(/\/skipavatar/, (msg) => {
    const chatId = msg.chat.id;

    if (!userData[chatId] || userData[chatId].step !== 3) {
        bot.sendMessage(chatId, '❌ Эта команда доступна только во время создания био-страницы.');
        return;
    }

    // Пропускаем аватар
    userData[chatId].step = 4;
    finalizeBio(chatId);
});

// Обработчик документов (для аватаров)
bot.on('document', (msg) => {
    const chatId = msg.chat.id;

    if (!userData[chatId] || userData[chatId].step !== 3) return;

    const doc = msg.document;
    const fileId = doc.file_id;

    // Загружаем документ
    bot.getFile(fileId).then(file => {
        const filePath = file.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const localPath = path.join(__dirname, 'public', `avatar_${chatId}.jpg`);

        // Сохраняем информацию об аватаре
        userData[chatId].avatar = `/avatar_${chatId}.jpg`;
        userData[chatId].step = 4;

        // Загружаем файл
        const fileStream = fs.createWriteStream(localPath);

        https.get(downloadUrl, response => {
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                finalizeBio(chatId);
            });
        });
    }).catch(error => {
        console.error('Ошибка при загрузке аватара:', error);
        bot.sendMessage(chatId, '❌ Ошибка при загрузке аватара. Пожалуйста, попробуйте еще раз.');
    });
});

// Функция для завершения создания био-страницы
function finalizeBio(chatId) {
    bot.sendMessage(chatId, '✅ Ваша био-страница готова!\n\n' +
        'Используйте команду /mybio для получения ссылки на вашу страницу.');
}

// Маршрут для био-страниц
app.get('/bio/:id', (req, res) => {
    const bioId = req.params.id;
    const chatId = bioId.replace('bio_', '');

    if (!userData[chatId]) {
        return res.status(404).send('Био-страница не найдена');
    }

    const data = userData[chatId];

    // Чтение шаблона
    fs.readFile(path.join(__dirname, 'public', 'bio-template.html'), 'utf8', (err, template) => {
        if (err) {
            console.error('Ошибка чтения шаблона:', err);
            return res.status(500).send('Ошибка сервера');
        }

        // Замена плейсхолдеров
        let html = template
            .replace('{{ bg_url }}', data.background || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')
            .replace('{{ ava_url }}', data.avatar || 'https://i.pravatar.cc/300?img=1')
            .replace('{{ text }}', data.text || 'Привет! Это моя био-страница.');

        res.send(html);
    });
});

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>BioBot - Создайте свою био-страницу</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                h1 { color: #333; }
                p { color: #666; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>🌟 BioBot</h1>
            <p>Создайте красивую био-страницу для своего Telegram профиля!</p>
            <p>Начните с бота: <a href="https://t.me/your_bot_name" target="_blank">@your_bot_name</a></p>
        </body>
        </html>
    `);
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Бот запущен и слушает сообщения...`);
    console.log(`Домен: ${DOMAIN}`);
    console.log(`Используйте команду /start в Telegram для начала работы.`);
});

console.log('Бот и сервер запущены. Используйте команду /start в Telegram для начала работы.');