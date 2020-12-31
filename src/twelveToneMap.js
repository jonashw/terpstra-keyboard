import KeyMapping from "./KeyMapping";
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

class TwelveToneMap extends KeyMapping {
  constructor() {
    super("12-tone", "12-tone");
  }
  coordToKey(startingOctave, coord) {
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
      id: `${y}.${x}`,
      label: octaveNote,
      color: keyColors[i + startAdjust] === 1 ? "#ffffff" : "#555555",
      synthTone: octaveNote,
      coord,
      //
      note,
      octave,
      letter: note[0],
      accidental,
      octaveNote: `${note}${octave}`
    };
  }
}

export default new TwelveToneMap();
