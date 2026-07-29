import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.api.methods.updates.SetWebhook;
import org.telegram.telegrambots.meta.api.methods.updates.DeleteWebhook;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.User;
import org.telegram.telegrambots.meta.api.objects.MessageEntity;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.bots.AbstractionBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.files.SendDocument;
import org.telegram.telegrambots.meta.api.objects.InputFile;
import org.telegram.telegrambots.meta.api.objects.PhotoSize;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class BioBot extends AbstractionBot {
    
    private static final String BOT_TOKEN = System.getenv("TELEGRAM_TOKEN") != null 
        ? System.getenv("TELEGRAM_TOKEN") 
        : "8934177430:AAErdMlLWOm11VH_h8qKSNV4iEgdUI6gEwc";
    
    private static final String GITHUB_PAGES_URL = "https://mortti731-maker.github.io/atmosphere-bot-bio1/";
    
    // Хранилище данных пользователей: chatId -> данные
    private Map<Long, UserData> userDatas = new HashMap<>();
    
    // Класс для хранения данных пользователя
    static class UserData {
        int step = 0;
        String text = "";
        String bg = "";
        String avatar = "";
        
        UserData() {
            this.step = 1;
        }
    }
    
    @Override
    public String getBotToken() {
        return BOT_TOKEN;
    }
    
    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasChat()) {
            Message message = update.getMessage();
            long chatId = message.getChatId();
            User user = message.getFrom();
            String text = message.getText();
            
            System.out.println("Сообщение от @" + (user.getUserName() != null ? user.getUserName() : chatId) 
                + ": " + text);
            
            // Команды
            if (text.equals("/start")) {
                cmdStart(chatId);
            } else if (text.equals("/help")) {
                cmdHelp(chatId);
            } else if (text.equals("/setbio")) {
                cmdSetBio(chatId);
            } else if (text.equals("/mybio")) {
                cmdMyBio(chatId);
            } else if (text.equals("/skip")) {
                cmdSkipAvatar(chatId);
            } else if (text.equals("/cancel")) {
                cmdCancel(chatId);
            } else {
                // Обработка обычного текста
                processMessage(chatId, message);
            }
        }
    }
    
    // Команда /start
    private void cmdStart(long chatId) {
        String text = "🌟 <b>BioBot</b> 🌟\n\n" +
            "Создайте красивую био-страницу для Telegram!\n\n" +
            "Команды:\n" +
            "/setbio — создать био-страницу\n" +
            "/mybio — получить ссылку\n" +
            "/help — помощь";
        sendMessage(chatId, text);
    }
    
    // Команда /help
    private void cmdHelp(long chatId) {
        String text = "💡 <b>Как создать био:</b>\n\n" +
            "1. /setbio — начать создание\n" +
            "2. Отправьте текст\n" +
            "3. Отправьте фото (фон)\n" +
            "4. Отправьте фото (аватар) или /skip\n" +
            "5. /mybio — получить ссылку";
        sendMessage(chatId, text);
    }
    
    // Команда /setbio
    private void cmdSetBio(long chatId) {
        UserData userData = new UserData();
        userDatas.put(chatId, userData);
        sendMessage(chatId, "✏️ Отправьте текст для био-страницы:");
    }
    
    // Команда /mybio
    private void cmdMyBio(long chatId) {
        UserData userData = userDatas.get(chatId);
        if (userData == null || userData.text.isEmpty()) {
            sendMessage(chatId, "❌ Сначала создайте био: /setbio");
            return;
        }
        
        // Фоны и аватары по умолчанию
        String defaultBg = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1974&q=80";
        String defaultAvatar = "https://i.pravatar.cc/300?img=1";
        
        String bg = userData.bg.isEmpty() ? defaultBg : userData.bg;
        String avatar = userData.avatar.isEmpty() ? defaultAvatar : userData.avatar;
        
        // Создаём URL
        String url = GITHUB_PAGES_URL + "?text=" + encode(userData.text) 
            + "&bg=" + encode(bg) + "&ava=" + encode(avatar);
        
        String text = "🔗 <b>Ваша био-страница:</b>\n\n" + url;
        sendMessage(chatId, text);
    }
    
    // Команда /skip (пропустить аватар)
    private void cmdSkipAvatar(long chatId) {
        UserData userData = userDatas.get(chatId);
        if (userData == null || userData.step != 3) {
            sendMessage(chatId, "❌ Эта команда доступна только во время создания био.");
            return;
        }
        
        userData.step = 4;
        sendMessage(chatId, "✅ Аватар пропущен! Отправьте /mybio для получения ссылки.");
    }
    
    // Команда /cancel
    private void cmdCancel(long chatId) {
        userDatas.remove(chatId);
        sendMessage(chatId, "❌ Создание био отменено. Отправьте /setbio чтобы начать заново.");
    }
    
    // Обработка обычного текста
    private void processMessage(long chatId, Message message) {
        UserData userData = userDatas.get(chatId);
        if (userData == null) return;
        
        int step = userData.step;
        
        if (step == 1) {
            // Текст био
            userData.text = message.getText();
            userData.step = 2;
            sendMessage(chatId, "📷 Отправьте фото для фона био-страницы:");
            
        } else if (step == 2) {
            // Фото для фона
            if (message.hasPhoto() && !message.getPhoto().isEmpty()) {
                List<PhotoSize> photos = message.getPhoto();
                PhotoSize largestPhoto = photos.get(photos.size() - 1);
                String fileId = largestPhoto.getFileId();
                String fileUrl = "https://api.telegram.org/file/bot" + BOT_TOKEN + "/" + fileId;
                userData.bg = fileUrl;
                userData.step = 3;
                sendMessage(chatId, "🖼️ Отправьте фото для аватара или /skip:");
            }
            
        } else if (step == 3) {
            // Фото для аватара
            if (message.hasPhoto() && !message.getPhoto().isEmpty()) {
                List<PhotoSize> photos = message.getPhoto();
                PhotoSize largestPhoto = photos.get(photos.size() - 1);
                String fileId = largestPhoto.getFileId();
                String fileUrl = "https://api.telegram.org/file/bot" + BOT_TOKEN + "/" + fileId;
                userData.avatar = fileUrl;
                userData.step = 4;
                sendMessage(chatId, "✅ Готово! Отправьте /mybio для получения ссылки.");
            }
        }
    }
    
    // Отправка сообщения
    private void sendMessage(long chatId, String text) {
        SendMessage message = new SendMessage();
        message.setChatId(String.valueOf(chatId));
        message.setText(text);
        message.setParseMode("HTML");
        
        try {
            execute(message);
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }
    
    // URL кодирование
    private String encode(String value) {
        return URLDecoder.encode(value, StandardCharsets.UTF_8);
    }
    
    // Главный метод
    public static void main(String[] args) {
        try {
            TelegramBotsApi botsApi = new TelegramBotsApi();
            BioBot bot = new BioBot();
            
            // Удаляем вебхук (используем polling)
            try {
                DeleteWebhook deleteWebhook = new DeleteWebhook();
                deleteWebhook.setDropPendingUpdates(true);
                botsApi.registerBot(bot);
            } catch (Exception e) {
                System.err.println("Ошибка при регистрации бота: " + e.getMessage());
            }
            
            System.out.println("🤖 Бот запущен! Используйте /start в Telegram.");
        } catch (Exception e) {
            System.err.println("Ошибка при запуске: " + e.getMessage());
        }
    }
}
