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
  ],
  "order": [0, 0, 0],
  "patterns": [
    {
      "length": 64,
      "channels": [
        {
          0: { "note": "E-6", "sample": 0, "vol": "v64", "fx": "SD1" },
          4: { "note": "C-6", "sample": 0, "vol": "v64", "fx": "SD1" }
        },
        {
          2: { "note": "E-6", "sample": 0, "vol": "v64", "fx": "SD1" },
          4: { "note": "G-6", "sample": 0, "vol": "v64", "fx": "SD1" }
        }
      ]
    }
  ]
});
console.log(it);
fs.writeFileSync("example.it", Buffer.from(it));
