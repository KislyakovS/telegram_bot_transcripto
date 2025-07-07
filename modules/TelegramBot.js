const TelegramBotNode = require("node-telegram-bot-api");

module.exports = class TelegramBot {
  constructor(token, options) {
    this.bot = new TelegramBotNode(token, options);
  }

  onVoiceMessage(cb) {
    this.bot.on("message", (msg) => {
      if (msg.voice) {
        cb(msg, msg.chat.id);
      }
    });
  }

  onVideoMessage(cb) {
    this.bot.on("message", (msg) => {
      if (msg.video) {
        cb(msg, msg.chat.id);
      }
    });
  }
};
