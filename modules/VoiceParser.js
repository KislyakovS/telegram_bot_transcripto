const fs = require("fs");
const vosk = require("vosk");

module.exports = class VoiceParser {
  static hasModel = (modelPath) => {
    return fs.existsSync(modelPath);
  };

  constructor(modelPath, { sampleRate = 16000 } = {}) {
    if (!VoiceParser.hasModel(modelPath)) {
      throw new Error(`❌ Модель (${modelPath}) не найдена`);
    }

    this.model = new vosk.Model(modelPath);
    this.rec = new vosk.Recognizer({ model: this.model, sampleRate });
  }

  parse = (voiceBuffer) => {
    this.rec.acceptWaveform(voiceBuffer);
    const result = this.rec.finalResult();
    this.rec.free();

    return result.text;
  };
};
