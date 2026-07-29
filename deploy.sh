#!/bin/bash

# Telegram Bio Bot Deployment Script
# Автоматическое развертывание на Render.com

echo "🚀 Начало развертывания Telegram Bio Bot"

# Шаг 1: Установка зависимостей
echo "📦 Установка зависимостей..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка при установке зависимостей"
    exit 1
fi

# Шаг 2: Проверка переменных окружения
echo "🔍 Проверка переменных окружения..."
if [ -z "$TELEGRAM_TOKEN" ]; then
    echo "⚠️  TELEGRAM_TOKEN не установлен, используется токен по умолчанию"
    TELEGRAM_TOKEN="8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc"
fi

if [ -z "$DOMAIN" ]; then
    echo "⚠️  DOMAIN не установлен, используется localhost"
    DOMAIN="localhost"
fi

echo "✅ Токен бота: $TELEGRAM_TOKEN"
echo "✅ Домен: $DOMAIN"

# Шаг 3: Сборка проекта
echo "🔨 Сборка проекта..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Ошибка при сборке проекта"
    exit 1
fi

# Шаг 4: Запуск сервера
echo "🌐 Запуск сервера..."
if [ "$NODE_ENV" = "production" ]; then
    echo "🎯 Режим: Production"
    node index.js
else
    echo "🎯 Режим: Development"
    nodemon index.js
fi

echo "🎉 Развертывание завершено!"