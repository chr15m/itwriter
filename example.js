/* jshint esversion: 6 */

const fs = require("fs");

const itwriter = require("./itwriter.js");

const sine = [...(new Array(4410))].map((v, i) => Math.sin(i/10));

wavdata = [sine, sine].map((channel) => {
  const int16Array = new Int16Array(channel.length);
  channel.map((sample, i) => {
    const s = Math.max(-1, Math.min(1, sample));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  });
  int16Array.buffer.sampleLength = channel.length;
  // console.log(int16Array.buffer);
  return int16Array.buffer;
});

const it = itwriter({"samples": wavdata});
console.log(it);
fs.writeFileSync("example.it", Buffer.from(it));
