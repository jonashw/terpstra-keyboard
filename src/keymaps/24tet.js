import KeyMap from "./KeyMap";
import ETScale from "./ETScale";
const hz = ETScale(24, 27.5);

const tones = [
  "C",
  "C≠",
  "C♯",
  "C𝄪",
  "D",
  "D≠",
  "D♯",
  "D𝄪",
  "E",
  "E≠",
  "F",
  "F≠",
  "F♯",
  "F𝄪",
  "G",
  "G≠",
  "G♯",
  "G𝄪",
  "A",
  "A≠",
  "A♯",
  "A𝄪",
  "B",
  "B≠"
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
    const startAdjust = 6;
    let [y, x] = coord;
    let raw_i = this.noteIndexAt(coord) - startAdjust;
    let i = raw_i % tones.length;
    let stepsOverA0 = raw_i + startAdjust + (startingOctave - 1) * 24;

    let octave = startingOctave + Math.floor(raw_i / tones.length);
    let note = tones.slice(i)[0];
    let octaveNote = `${note}${octave}`;
    let accidental = note.length === 1 ? "" : note[1];
    return {
      id: `${y}.${x}`,
      label: tones.slice(i)[0],
      color: this.colorMap.slice(i % this.colorMap.length)[0],
      synthTone: hz(stepsOverA0),
      coord,
      //
      note,
      octave,
      letter: note[0],
      accidental,
      octaveNote
    };
  }
}

export default TwentyFourTET;
