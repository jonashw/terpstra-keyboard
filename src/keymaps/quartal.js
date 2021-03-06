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
const quartal = {
  minRows: 9,
  rowLength: 10,
  noteAt: ([y, x]) => 5 * (y % 2) + 9 * x + Math.floor(y / 2)
};
const halberstadt = {
  minRows: 4,
  rowLength: 14,
  noteAt: ([y, x]) => 2 * x + (y % 2)
};
class Quartal extends KeyMap {
  constructor() {
    super("quartal", "Quartal");
  }
  coordToKey(startingOctave, coord) {
    if (!coord) {
      return undefined;
    }
    let layout = quartal;
    const startAdjust = 3;
    let [y, x] = coord;
    let raw_i = layout.noteAt(coord) - startAdjust;
    let i = raw_i % tones.length;
    let octave = startingOctave + Math.floor(raw_i / tones.length);
    let note = tones.slice(i)[0];
    let label = labels.slice(i)[0];
    let octaveNote = `${note}${octave}`;
    let accidental = note.length === 1 ? "" : note[1];
    return {
      id: `${y}.${x}`,
      label: label + octave,
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

export default new Quartal();
