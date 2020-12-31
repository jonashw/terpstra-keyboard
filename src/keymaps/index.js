import React from "react";
import TwelveTET from "./12tet";
import fourtyEightEDO from "./48edo";

import KeyMap from "./KeyMap";
class Single extends KeyMap {
  constructor() {
    super("single note", "Single Note");
  }
  coordToKey(o, c) {
    let k = super.coordToKey(o, c);
    k.color = "#eeeeee";
    return k;
  }
}
let single = new Single();

const twelveTetLayout = {
  quartal: {
    minRows: 9,
    rowLength: 10,
    noteIndexAt: ([y, x]) =>
      /*
      Notes progress top-to-bottom, left-to-right.
      Expected that columns alternate in length between 5 and 4 keys.
      The major value in this layout is that it makes these intervals
      accessible with neighboring keys:
      - Major 3rd / Minor 6th
      - Major 6th / Minor 3rd
      - 4th / 5th
    */
      5 * (y % 2) + (5 + 4) * x + Math.floor(y / 2)
  },
  halberstadt: {
    minRows: 4,
    rowLength: 14,
    noteIndexAt: ([y, x]) => 2 * x + (y % 2)
  }
};

const all = [
  new TwelveTET(
    "quartal",
    "12tet quartal",
    twelveTetLayout.quartal.noteIndexAt
  ),
  new TwelveTET(
    "halberstadt",
    "12tet halberstadt",
    twelveTetLayout.halberstadt.noteIndexAt
  ),
  single,
  fourtyEightEDO
];

const htmlKeyLabelFn = (currentMapping) => {
  if (currentMapping instanceof TwelveTET) {
    return (key) => (
      <span key={key.octaveNote}>
        <span>{key.letter}</span>
        <sup>{key.accidental}</sup>
        <sub>{key.octave}</sub>
      </span>
    );
  } else {
    return (key) => key.label;
  }
};
export default {
  htmlKeyLabelFn,
  all: all,
  byId: all.reduce((dict, m) => {
    dict[m.id] = m;
    return dict;
  }, {})
};
