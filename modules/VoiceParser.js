const fs = require("fs");
const vosk = require("vosk");

module.exports = class VoiceParser {
  static hasModel = (modelPath) => {
    return fs.existsSync(modelPath);
  };

  constructor(modelPath) {
    if (!VoiceParser.hasModel(modelPath)) {
      throw new Error(`❌ Модель (${modelPath}) не найдена`);
    }

    this.model = new vosk.Model(modelPath);
  }

  parse = (stream, { sampleRate = 16000 } = {}) => {
    const rec = new vosk.Recognizer({ model: this.model, sampleRate });
    return new Promise((resolve, reject) => {
      stream.on("data", (data) => rec.acceptWaveform(data));
      stream.on("end", () => {
        const result = rec.finalResult();
        rec.free();
        resolve(result.text);
      });
      stream.on("error", reject);
    });
  };
};
