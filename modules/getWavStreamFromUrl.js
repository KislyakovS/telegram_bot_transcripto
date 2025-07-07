const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const crypto = require("crypto");

ffmpeg.setFfmpegPath(ffmpegPath);

const getWavStreamFromUrl = async (link) => {
  const base = crypto.randomUUID();
  const oggPath = path.join("./media", `${base}.ogg`);
  const wavPath = path.join("./media", `${base}.wav`);

  const response = await axios.get(link, { responseType: "stream" });
  const writer = fs.createWriteStream(oggPath);
  await new Promise((res, rej) => {
    response.data.pipe(writer);
    writer.on("finish", res);
    writer.on("error", rej);
  });

  await new Promise((res, rej) => {
    ffmpeg(oggPath)
      .noVideo()
      .audioCodec("pcm_s16le")
      .audioFrequency(16000)
      .audioChannels(1)
      .format("wav")
      .on("end", res)
      .on("error", rej)
      .save(wavPath);
  });

  return {
    stream: fs.createReadStream(wavPath, { highWaterMark: 4096 }),
    remove: () => {
      fs.unlink(oggPath, () => {});
      fs.unlink(wavPath, () => {});
    },
  };
};

module.exports = { getWavStreamFromUrl };
