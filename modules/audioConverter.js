const fs = require("fs");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const downloadVoiceMessage = async (fileUrl, oggPath) => {
  const response = await axios.get(fileUrl, { responseType: "stream" });
  const oggWriter = fs.createWriteStream(oggPath);

  return await new Promise((resolve, reject) => {
    response.data.pipe(oggWriter);
    oggWriter.on("finish", resolve);
    oggWriter.on("error", reject);
  });
};

const convertOggToWav = async (oggPath, wavPath) => {
  return await new Promise((resolve, reject) => {
    ffmpeg(oggPath)
      .audioFrequency(16000)
      .audioChannels(1)
      .format("wav")
      .on("end", resolve)
      .on("error", reject)
      .save(wavPath);
  });
};

const downloadAndConvertOggToWav = async (fileUrl, oggPath, wavPath) => {
  await downloadVoiceMessage(fileUrl, oggPath);
  await convertOggToWav(oggPath, wavPath);
};

module.exports = { downloadAndConvertOggToWav };
