Create Impulse Tracker .it files from a JSON song datastructure.

See the [browser demo here](https://chr15m.github.io/itwriter) and the node demo in the install section below.

## Install

```
npm i itwriter
npm run example
```

## Use

Basic usage: `const bytebuffer = itwriter(song_structure)`

More detailed usage:

```javascript
import itwriter from "./index.js";

// create a 10ms sinewave sample
const sine = [...(new Array(4410))].map((v, i) => Math.sin(i/10));

const buffer = itwriter({
  "title": "example",
  "bpm": 120,
  "samples": [{"name": "sine wave", "samplerate": 44100, "channels": [sine]}],
  "patterns": [{
    "rows": 32,
    "channels": [{
      0: {
        "note": "C-5",
        "instrument": 0,
        "vol": "v64",
      }
    }]
  }],
  "order": [0],
});

// in Node we can write to disk
import fs from "fs";
fs.writeFileSync("example.it", Buffer.from(it));

// in the browser we can download a blob
document.location.href = URL.createObjectURL(new File([it], {"name": "example.it"}))
```

See [./example.js](example.js) for a detailed example of the JSON song structure.

## Notes

- Currently only patterns and 16-bit mono/stereo samples are supported, not instruments.

## Technical references used

- <https://github.com/OpenMPT/openmpt/blob/master/soundlib/Load_it.cpp>
- <https://github.com/apollolux/lux-impulse-phoenix/blob/master/ITTECH.TXT>
- <https://fileformats.fandom.com/wiki/Impulse_tracker>
- <https://github.com/bunnytrack/umx-converter>
