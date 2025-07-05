const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const TelegramBot = require("node-telegram-bot-api");
const VoiceParser = require("./modules/VoiceParser.js");
const { downloadAndConvertOggToWav } = require("./modules/audioConverter.js");
require("dotenv").config();

const voiceParser = new VoiceParser(process.env.VOSK_MODEL_PATH);
const bot = new TelegramBot(process.env.TG_BOT_TOKEN, { polling: true });

const createPathVoiceFile = (extension) =>
  path.join(process.cwd(), "voices", `${crypto.randomUUID()}.${extension}`);

bot.on("voice", async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.voice.file_id;

  bot.sendMessage(chatId, "🔊 Обрабатываю голос...");

  try {
    const fileLink = await bot.getFileLink(fileId);
    const oggPath = createPathVoiceFile("ogg");
    const wavPath = createPathVoiceFile("wav");

    await downloadAndConvertOggToWav(fileLink, oggPath, wavPath);

    const voiceText = voiceParser.parse(fs.readFileSync(wavPath));

    bot.sendMessage(chatId, `📝 Текст: ${voiceText ?? "[нет текста]"}`);

    fs.unlink(oggPath, () => {});
    fs.unlink(wavPath, () => {});
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "⚠️ Ошибка при обработке");
  }
});
