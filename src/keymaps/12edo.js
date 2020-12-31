import KeyMap from "./KeyMap";
const tones = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const labels = [
  "C",
  "C♯",
  "D",
  "E♭",
  "E",
  "F",
  "F♯",
  "G",
  "A♭",
  "A",
  "B♭",
  "B"
];

const keyColors = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];

class TwelveEDO extends KeyMap {
  constructor() {
    super("12-edo", "12-edo");
  }
  coordToKey(startingOctave, coord) {
    if (!coord) {
      return undefined;
    }
    const startAdjust = 3;
    let [y, x] = coord;
    let raw_i = 2 * x + (y % 2) - startAdjust;
    let i = raw_i % tones.length;
    let octave = startingOctave + Math.floor(raw_i / tones.length);
    let note = tones.slice(i)[0];
    let octaveNote = `${note}${octave}`;
    let accidental = note.length === 1 ? "" : note[1];
    return {
      id: `${y}.${x}`,
      label: labels.slice(i)[0] + octave,
      color: keyColors.slice(i)[0] === 1 ? "#ffffff" : "#555555",
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

export default new TwelveEDO();
