const fs = require("fs");

const itwriter = require("./index.js");

const sine = [...(new Array(4410))].map((v, i) => Math.sin(i/10));
const square = [...(new Array(4410))].map((v, i) => Math.sin(i/10) > 0 ? 1 : -1);
const noisefn = () => [...(new Array(441))].map((v, i) => Math.random() * 2 - 1);

const it = itwriter({
  "title": "itwriter example",
  "bpm": 125,
  "ticks": 4,
  "message": "hello!\n\nthis is my song message.",
  "samples": [
    {
      "filename": "sine.wav",
      "name": "sinewave",
      "samplerate": 44100,
      "channels": [sine, sine]
    },
    {
      "filename": "sqr.wav",
      "name": "brutal square",
      "samplerate": 44100,
      "channels": [square]
    },
    {
      "filename": "noise.wav",
      "name": "noise clip",
      "samplerate": 22050,
      "channels": [noisefn(), noisefn()]
    }
  ],
  "channelnames": {
    1: "thingo"
  },
  "order": [0, 1, 0],
  "patterns": [
    {
      "rows": 16, // pattern length in rows
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
      "name": "a patn name",
      "rows": 8,
      "channels": [
        {
          0: {"note": "C-5", "instrument": 0, "vol": "v64"},
          1: {"vol": "p54"},
          3: {"vol": "g03"},
          5: {"note": "C-5", "instrument": 2, "vol": "v64"},
        }
      ]
    },
  ]
});
console.log(it);
fs.writeFileSync("example.it", Buffer.from(it));
