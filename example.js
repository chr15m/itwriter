import fs from "fs";
import itwriter from "./index.js";
import AudioBuffer from "audio-buffer";

/* Make some samples. */
const sine = [...(new Array(4410))].map((v, i) => Math.sin(i/10));
const square = [...(new Array(4410))].map((v, i) => Math.sin(i/10) > 0 ? 1 : -1);
const noisefn = () => [...(new Array(480))].map((v, i) => Math.random() * 2 - 1);
const noisebuffer = new AudioBuffer({"length": 480, "sampleRate": 48000, "numberOfChannels": 2});
noisebuffer.copyToChannel(noisefn(), 0);
noisebuffer.copyToChannel(noisefn(), 1);

/* Create an impulse tracker file from JSON structure. */
const it = itwriter({
  "title": "itwriter example", // track title
  "bpm": 125, // how fast to play in bpm
  "ticks": 4, // how many ticks to fit in each row
  "mixvol": 48, // mix volume - max 128
  "message": "hello!\n\nthis is my song message.", // optional embedded message
  "samples": [
    { // samples can be stereo or mono floating point format
      "filename": "sine.wav",
      "name": "sinewave",
      "samplerate": 44100,
      "channels": [sine, sine] // stereo
    },
    {
      "filename": "sqr.wav",
      "name": "brutal square",
      "samplerate": 22050, // different sample rate
      "channels": [square] // mono
    },
    {
      "filename": "noise.wav",
      "name": "noise clip",
      "buffer": noisebuffer, // samples can also be an AudioBuffer
    }
  ],
  "channelnames": { // zero-indexed channel names (optional)
    1: "thingo"
  },
  "order": [0, 1, 0], // what order to play the patterns
  "patterns": [
    {
      "rows": 16, // pattern length in rows
      "channels": [
        { // zero-indexed list of events in each vertical channel
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
      "name": "a patn name", // optional pattern name
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
  ],
  // tracker ID: https://wiki.openmpt.org/Development:_Formats/IT#Tracker_IDs
  "tracker_id": 0xD1CE,
});
console.log(it);
// in Node we can write to disk
fs.writeFileSync("example.it", Buffer.from(it));
// in the browser we can download a blob
// document.location.href = URL.createObjectURL(new File([it], "example.it"))
