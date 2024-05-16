/* jshint esversion: 6 */

const fs = require("fs");

const itwriter = require("./itwriter.js");

const sine = [...(new Array(4410))].map((v, i) => Math.sin(i/10));

const it = itwriter({
  "title": "itwriter example",
  "samples": [
    {
      "filename": "sine.wav",
      "name": "sinewave",
      "samplerate": 44100,
      "channels": [sine, sine]
    }
  ]
});
console.log(it);
fs.writeFileSync("example.it", Buffer.from(it));
