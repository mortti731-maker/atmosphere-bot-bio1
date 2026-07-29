from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.utils.markdown import hide_link
import urllib.parse
import os

# Токен бота
TOKEN = os.getenv('TELEGRAM_TOKEN', '8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc')
GITHUB_PAGES_URL = 'https://mortti731-maker.github.io/atmosphere-bot-bio1/'

bot = Bot(token=TOKEN)
dp = Dispatcher()

# Хранилище данных пользователей
user_data = {}


@dp.command(Command('start'))
async def cmd_start(message: Message):
    await message.answer(
        '🌟 <b>BioBot</b> 🌟\n\n'
        'Создайте красивую био-страницу для Telegram!\n\n'
        'Команды:\n'
        '/setbio — создать био-страницу\n'
        '/mybio — получить ссылку\n'
        '/help — помощь',
        parse_mode='HTML'
    )


@dp.command(Command('help'))
async def cmd_help(message: Message):
    await message.answer(
        '💡 <b>Как создать био:</b>\n\n'
        '1. /setbio — начать создание\n'
        '2. Отправьте текст\n'
        '3. Отправьте фото (фон)\n'
        '4. Отправьте фото (аватар) или /skip\n'
        '5. /mybio — получить ссылку',
        parse_mode='HTML'
    )


@dp.command(Command('setbio'))
async def cmd_setbio(message: Message):
    user_data[message.from_user.id] = {'step': 1, 'text': '', 'bg': '', 'avatar': ''}
    await message.answer('✏️ Отправьте текст для био-страницы:')


@dp.command(Command('mybio'))
async def cmd_mybio(message: Message):
    user_id = message.from_user.id
    if user_id not in user_data or not user_data[user_id].get('text'):
        await message.answer('❌ Сначала создайте био: /setbio')
        return

    data = user_data[user_id]

    # Заменяем спецсимволы в тексте для URL
    text_encoded = urllib.parse.quote(data['text'])
    bg_encoded = urllib.parse.quote(data['bg']) if data['bg'] else urllib.parse.quote(
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1974&q=80'
    )
    ava_encoded = urllib.parse.quote(data['avatar']) if data['avatar'] else urllib.parse.quote(
        'https://i.pravatar.cc/300?img=1'
    )

    url = f"{GITHUB_PAGES_URL}?text={text_encoded}&bg={bg_encoded}&ava={ava_encoded}"

    caption = f'🔗 <b>Ваша био-страница:</b>\n\n{url}'
    await message.answer(caption, parse_mode='HTML', disable_web_page_preview=True)


@dp.message()
async def process_message(message: Message):
    user_id = message.from_user.id

    if user_id not in user_data:
        return

    data = user_data[user_id]
    step = data['step']

    if step == 1:
        # Текст био
        data['text'] = message.text
        data['step'] = 2
        await message.answer('📷 Отправьте фото для фона био-страницы:')

    elif step == 2:
        if message.photo:
            file_id = message.photo[-1].file_id
            file_info = await bot.get_file(file_id)
            data['bg'] = f'https://api.telegram.org/file/bot{TOKEN}/{file_info.file_path}'
            data['step'] = 3
            await message.answer('🖼️ Отправьте фото для аватара или /skip:')

    elif step == 3:
        if message.photo:
            file_id = message.photo[-1].file_id
            file_info = await bot.get_file(file_id)
            data['avatar'] = f'https://api.telegram.org/file/bot{TOKEN}/{file_info.file_path}'
            data['step'] = 4
            await message.answer('✅ Готово! Отправьте /mybio для получения ссылки.')


@dp.message(types.ForceReply())
async def skip_avatar(message: Message):
    user_id = message.from_user.id
    if user_id in user_data and user_data[user_id]['step'] == 3:
        user_data[user_id]['step'] = 4
        await message.answer('✅ Аватар пропущен! Отправьте /mybio для получения ссылки.')


if __name__ == '__main__':
    print('🤖 Бот запущен...')
    dp.run_polling(bot)
