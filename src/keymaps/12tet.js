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

const genericHz = (stepsPerOctave, refPitch) => (stepsOverRefPitch) =>
  refPitch * Math.pow(Math.pow(2, 1 / stepsPerOctave), stepsOverRefPitch);

const hz = genericHz(12, 27.5);

//55FF55

class TwelveTET extends KeyMap {
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
    let stepsOverA0 = raw_i + startAdjust + (startingOctave - 1) * 12;
    let note = tones.slice(i)[0];
    let octaveNote = `${note}${octave}`;
    console.log(raw_i, octaveNote, stepsOverA0, hz(stepsOverA0));
    let accidental = note.length === 1 ? "" : note[1];
    return {
      id: `${y}.${x}`,
      label: labels.slice(i)[0] + octave,
      color: this.colorMap.slice(i % this.colorMap.length)[0],
      synthTone: hz(stepsOverA0),
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

export default TwelveTET;
