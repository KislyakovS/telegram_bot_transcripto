const TelegramBot = require("node-telegram-bot-api");
const VoiceParser = require("./modules/VoiceParser.js");
const { getWavStreamFromUrl } = require("./modules/getWavStreamFromUrl.js");

require("dotenv").config();

const voiceParser = new VoiceParser(process.env.VOSK_MODEL_PATH);
const telegram = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

const isEmptyString = (str) =>
  str === null || str === undefined || str.trim() === "";

telegram.on("message", async (message) => {
  const chatID = message.chat.id;

  telegram.sendMessage(chatID, "🔊 Обрабатываю голос...");

  try {
    const file = message.voice || message.video_note;

    if (!file || !file.file_id) {
      telegram.sendMessage(chatID, "⚠️ Отправь голосовое или видеосообщение.");

      return;
    }

    const fileLink = await telegram.getFileLink(file.file_id);
    const { stream, remove } = await getWavStreamFromUrl(fileLink);
    const voiceText = await voiceParser.parse(stream);

    telegram.sendMessage(
      chatID,
      `📝 Текст: ${isEmptyString(voiceText) ? "[нет текста]" : voiceText}`,
    );
    remove();
  } catch (error) {
    console.error(error);
    telegram.sendMessage(chatID, "⚠️ Ошибка при обработке");
  }
});
