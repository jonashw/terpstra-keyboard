const twelveTones = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B"
];

const keyColors = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];

const coordToKey = (startingOctave, coord) => {
  if (!coord) {
    return undefined;
  }
  const startAdjust = 0;
  let [y, x] = coord;
  let raw_i = 2 * x + (y % 2) - startAdjust;
  let i = raw_i % twelveTones.length;
  let octave = startingOctave + Math.floor(raw_i / twelveTones.length);
  let note = twelveTones.slice(i)[0];
  let octaveNote = `${note}${octave}`;
  let accidental = note.length === 1 ? "" : note[1];
  return {
    label: octaveNote,
    color: keyColors[i + startAdjust] === 1 ? "white" : "black",
    synthTone: octaveNote,
    coord,
    //
    note,
    octave,
    letter: note[0],
    accidental,
    octaveNote: `${note}${octave}`
  };
};

const coordToTone = (startingOctave, coord) => {
  let note = coordToKey(startingOctave, coord);
  if (!note) {
    return undefined;
  }
  return note.octaveNote;
};

const coordToSynthTone = (startingOctave, coord) => {
  let note = coordToKey(startingOctave, coord);
  if (!note) {
    return undefined;
  }
  return note.synthTone;
};

export default {
  id: "12-tone",
  label: "12-tone",
  getSynthToneAt: coordToSynthTone,
  getKeyAt: coordToKey
};
