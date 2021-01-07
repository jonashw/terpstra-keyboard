export default class KeyMap {
  constructor(id, label) {
    this.id = id;
    this.label = label;
  }

  getSynthToneAt(startingOctave, coord) {
    let note = this.coordToKey(startingOctave, coord);
    if (!note) {
      return undefined;
    }
    return note.synthTone;
  }

  getKeyAt(startingOctave, coord) {
    return this.coordToKey(startingOctave, coord);
  }

  coordToKey(startingOctave, coord) {
    let note = "C";
    return {
      label: note,
      octave: startingOctave,
      synthTone: note,
      color: "red",
      coord
    };
  }
}
