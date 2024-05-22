const fs = require("fs");

const itwriter = require("./itwriter.js");

const sine = [...(new Array(4410))].map((v, i) => Math.sin(i/10));

const it = itwriter({
  "title": "itwriter example",
  "bpm": 125,
  "ticks": 4,
  "samples": [
    {
      "filename": "sine.wav",
      "name": "sinewave",
      "samplerate": 44100,
      "channels": [sine, sine]
    }
  ],
  "channelnames": {
    1: "snares"
  },
  "order": [0, 1, 0],
  "patterns": [
    {
      "length": 16,
      "channels": [
        {
          0: { "note": "E-6", "instrument": 0, "vol": "v64" },
          4: { "note": "C-6", "instrument": 0, "vol": "v64" }
        },
        {
          2: { "note": "E-6", "vol": "v64", "fx": "SD1" },
          4: { "note": "G-6", "instrument": 1, "vol": "v32" }
        }
      ]
    },
    {
      "length": 8,
      "channels": [
        {
          0: {"note": "C-5", "instrument": 0, "vol": "v64"},
          1: {"vol": "p54"},
          3: {"vol": "g03"}
        }
      ]
    },
  ]
});
console.log(it);
fs.writeFileSync("example.it", Buffer.from(it));
