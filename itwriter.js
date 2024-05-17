/* jshint esversion: 6 */

/**
 * Converts JSON struture to an Impulse Tracker module file.
 * @param {Array} struct - see below
 * @returns {ArrayBuffer} containing the impulse tracker data to be downloaded or written to disk.
 * @note The JSON structure should have the following structure

const struct = {
  "title": "My Song",
  "bpm": 180,
  "samples": [
    {
      "name": "piano",
      "filename": "000000156.wav",
      "samplerate": 44100,
      "channels": [[...(new Array(4410))].map((v, i) => Math.sin(i/441))]
    }
  ],
  "sequence": [0],
  "patterns": [
    {
      "length": 64,
      "channels": [
        {
          "name": "piano",
          0: { "note": "E-6", "sample": 0, "vol": "v64", "fx": "SD1" },
          4: { "note": "C-6", "sample": 0, "vol": "v64", "fx": "SD1" }
        },
        {
          "name": "drums",
          2: { "note": "E-6", "sample": 1, "vol": "v64", "fx": "SD1" },
          4: { "note": "G-6", "sample": 1, "vol": "v64", "fx": "SD1" }
        }
      ]
    }
  ]
};

// TODO:
// - encode stereo samples correctly
// - use sample's samplerate
// - add channel names
// - multiple patterns
// - order patterns correctly

 */

// thanks to https://github.com/bunnytrack/umx-converter for initial reference implementation

function itwriter(struct) {
  const bitDepth = 16;
  const OrdNum = struct.order.length + 1;
  const InsNum = 0;
  const SmpNum = struct.samples.length;
  const PatNum = struct.patterns.length;

  // TODO: replace these
  const wavData = floatChannelsTo16bit(struct.samples[0].channels);

  // Calculate output file size
  // Initial part of header is always 0xC0 / 192 bytes
  // Calculate the headerSize of the impulse tracker file
  const headerSize  = 0xC0 + OrdNum + (InsNum * 4) + (SmpNum * 4) + (struct.patterns.length * 4);
  const sampleHeaderSize  = 0x50 * SmpNum;
  const rows = 16;
  const channels = 1;
  const patternsSize = (8 + (channels * 4) + rows) * 2;
  const sampleDataSize = (wavData.reduce((size, channel) => size + channel.byteLength, 0));

  // Output buffer/data view
  const buffer = new ArrayBuffer(headerSize + sampleHeaderSize + patternsSize + sampleDataSize);
  const data   = new DataView(buffer);

  let offset = 0;

  // Magic number
  writeString(data, offset, "IMPM");
  offset += 4;

  // Song title
  writeString(data, offset, (struct.title || "").slice(0, 26));
  offset += 26;

  // PHiligt - pattern row hilight information
  data.setUint16(offset, 0x0410);
  offset += 2;

  // OrdNum - number of orders in song
  data.setUint16(offset, OrdNum, true);
  offset += 2;

  // InsNum - number of instruments in song
  data.setUint16(offset, InsNum, true);
  offset += 2;

  // SmpNum - number of samples in song
  data.setUint16(offset, SmpNum, true);
  offset += 2;

  // PatNum - number of patterns in song
  data.setUint16(offset, PatNum, true);
  offset += 2;

  // Cwt/v - created with tracker
  data.setUint16(offset, 0x2951);
  offset += 2;

  // Cmwt - compatible with tracker with version greater than value
  data.setUint16(offset, 0x1402);
  offset += 2;

  // Flags (set to default from OpenMPT)
  data.setUint16(offset, 0x4900);
  offset += 2;

  // Special
  data.setUint16(offset, 0x0600);
  offset += 2;

  // GV - global volume
  data.setUint8(offset, 0x80);
  offset++;

  // MV - mix volume
  data.setUint8(offset, 0x30);
  offset++;

  // IS - initial speed of song
  // From OpenMPT docs: "In OpenMPT, 'Speed' means 'ticks per row'"
  // Set to 24 as "classic tempo" units are 24 ticks per minute
  data.setUint8(offset, 24);
  offset++;

  // IT - initial tempo of song
  data.setUint8(offset, 0x78); // 120 BPM
  offset++;

  // Sep - panning separation between channels
  data.setUint8(offset, 0x80);
  offset++;

  // PWD - pitch wheel depth for MIDI controllers
  data.setUint8(offset, 0x00);
  offset++;

  // MsgLgth / message offset / reserved
  offset += 10;

  // Channel pan - if stereo, pan L/R
  // 0  = hard left
  // 32 = centre
  // 64 = hard right
  if (wavData.length === 2) { // stereo
    data.setUint8(offset, 0x00);
    offset++;

    data.setUint8(offset, 0x40);
    offset++;
  } else { // mono
    data.setUint8(offset, 0x20);
    offset++;
  }

  for (let i = 0; i < 64 - wavData.length /* - (extraChannels * wavData.length) */; i++) {
    data.setUint8(offset, 0xA0);
    offset++;
  }

  // Channel vol
  for (let i = 0; i < 64; i++) {
    data.setUint8(offset, 0x40);
    offset++;
  }

  // Orders - order in which the patterns are played
  for (let o=0; o<struct.order.length; o++) {
    data.setUint8(offset, struct.order[o]);     // pattern 0
    offset += 1;
  }
  data.setUint8(offset, 0xFF); // "---", end of song marker
  offset += 1;

  // Instruments offset
  // 0 instruments, so do nothing here

  // Samples offset
  // 0x50 = Impulse Sample header size
  for (let i = 0; i < SmpNum; i++) {
    data.setUint32(offset, headerSize + (i * 0x50), true);
    offset += 4;
  }

  // Patterns offset
  data.setUint32(offset, headerSize + (SmpNum * 0x50), true);
  offset += 4;

  /**
   * Impulse Sample
   */
  for (let i = 0; i < SmpNum; i++) {
    writeString(data, offset, "IMPS");
    offset += 4;

    // DOS filename
    writeString(data, offset, (struct.samples[0].filename || struct.samples[0].name || "").slice(0, 12));
    offset += 12;

    // Always null
    offset++;

    // GvL - global volume for instrument
    data.setUint8(offset, 0x40);
    offset++;

    // Flg - bit 1 on = 16-bit; off = 8-bit
    data.setUint8(offset, bitDepth === 16 ? 0x03 : 0x01);
    offset++;

    // Vol - default volume for instrument
    data.setUint8(offset, 0x40);
    offset++;

    // Skip sample name
    writeString(data, offset, (struct.samples[0].name || struct.samples[0].filename || "").slice(0, 26));
    offset += 26;

    // Cvt / convert (bitmask; bit 1 on = signed samples; off = unsigned)
    // IT 2.02 and above use signed samples
    // OpenMPT appears to automatically convert 8-bit unsigned audio to signed
    data.setUint8(offset, 0x01);
    offset++;

    // DfP / default pan
    data.setUint8(offset, 0x20);
    offset++;

    // Length - length of sample in no. of samples (not bytes)
    data.setUint32(offset, wavData[i].sampleLength, true);
    offset += 4;

    // Loop Begin - start of loop (no of samples in, not bytes)
    // ignored
    offset += 4;

    // Loop End - sample no. AFTER end of loop
    // ignored
    offset += 4;

    // C5Speed - number of bytes a second for C-5 (ranges from 0->9999999)
    data.setUint32(offset, 44100, true);
    offset += 4;

    // SusLoop Begin - start of sustain loop
    // ignored
    offset += 4;

    // SusLoop End - sample no. AFTER end of sustain loop
    // ignored
    offset += 4;

    // SamplePointer - offset of sample in file (the WAV data)
    const prevSampleSize = wavData[i-1] !== undefined ? wavData[i-1].byteLength : 0;

    data.setUint32(offset, headerSize + sampleHeaderSize + patternsSize + prevSampleSize, true);
    offset += 4;

    // ViS - vibrato speed
    // ViD - vibrato depth
    // ViR - vibrato waveform type
    // ViT - vibrato rate, rate at which vibrato is applied
    // ignored
    offset += 4;
  }

  offset = serializePattern(offset, data);
  offset = serializePattern(offset, data);

  for (const channel of wavData) {
    const wavDataView = new DataView(channel.slice());

    for (let i = 0; i < wavDataView.byteLength; i++) {
      data.setUint8(offset, wavDataView.getUint8(i));
      offset++;
    }
  }

  return data.buffer;
}

function serializePattern(offset, data) {
  const rows = 16;
  const channels = 1;

  // Length - length of packed pattern, NOT including the 8 byte header
  data.setUint16(offset, (channels * 4) + rows, true);
  offset += 2;

  // Rows - number of rows in this pattern
  data.setUint16(offset, rows, true);
  offset += 2;

  // blank
  offset += 4;

  // Packed pattern - values below correspond to "C-5 01 v64 ..." etc.
  let channelNo = 0x81;

  for (let i = 1; i <= channels; i++) {
    data.setUint8(offset, channelNo);
    offset++;

    data.setUint8(offset, 0x03);
    offset++;

    data.setUint8(offset, 0x3C);
    offset++;

    data.setUint8(offset, i);
    offset++;

    channelNo++;
  }

  // null byte for every empty remaining row
  offset += rows;
  return offset;
}

function floatChannelsTo16bit(channels) {
  return channels.map((channel) => {
    const int16Array = new Int16Array(channel.length);
    channel.map((sample, i) => {
      const s = Math.max(-1, Math.min(1, sample));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    });
    int16Array.buffer.sampleLength = channel.length;
    return int16Array.buffer;
  });
}

function writeString(view, offset, string) {
  for (var i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

module.exports = itwriter;
