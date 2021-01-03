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

//≠♯𝄪
//dᵈ♭𝄫

//55FF55

class TwentyFourTET extends KeyMap {
  constructor(id, label, noteIndexAt, colorMap) {
    super(id, label);
    this.noteIndexAt = noteIndexAt;
    this.colorMap = colorMap;
  }
  coordToKey(startingOctave, coord) {
    if (!coord) {
      return undefined;
    }
    const startAdjust = 3;
    let [y, x] = coord;
    let raw_i = this.noteIndexAt(coord) - startAdjust;
    let i = raw_i % tones.length;
    let octave = startingOctave + Math.floor(raw_i / tones.length);
    let note = tones.slice(i)[0];
    let octaveNote = `${note}${octave}`;
    let accidental = note.length === 1 ? "" : note[1];
    return {
      id: `${y}.${x}`,
      label: labels.slice(i)[0] + octave,
      color: this.colorMap.slice(i % this.colorMap.length)[0],
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

export default TwentyFourTET;
