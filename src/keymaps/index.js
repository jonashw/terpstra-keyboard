import React from "react";
import TwelveTET from "./12tet";
import fourtyEightEDO from "./48edo";
import TwentyFourTET from "./24tet";

import ColorUtil from "../colorUtil";

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

const twelveTetColorMap = {
  bw: [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1].map((c) =>
    c === 1 ? "#ffffff" : "#555555"
  ),
  rainbow: ColorUtil.rainbow(12, 10)
};

const twentyFourTetColorMap = {
  gray: "abcdabcdababcdabcdabcdab"
    .split("")
    .map((c) =>
      c === "a"
        ? "#ffffff"
        : c === "b"
        ? "#cccccc"
        : c === "c"
        ? "#999999"
        : "#555555"
    ),
  rainbow: ColorUtil.rainbow(12, 10)
};

const twelveTetLayout = {
  quartal: {
    startingOctave: 0,
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
    startingOctave: 3,
    minRows: 4,
    rowLength: 14,
    noteIndexAt: ([y, x]) => 2 * x + (y % 2)
  }
};

const all = [
  new TwentyFourTET(
    "24tet",
    "24tet",
    ([y, x]) => 2 * x + (y % 2),
    twentyFourTetColorMap.gray
  ),
  new TwelveTET(
    "halberstadt b&w",
    "12tet halberstadt b&w",
    twelveTetLayout.halberstadt.noteIndexAt,
    twelveTetColorMap.bw
  ),
  new TwelveTET(
    "quartal",
    "12tet quartal b&w",
    twelveTetLayout.quartal.noteIndexAt,
    twelveTetColorMap.bw
  ),
  new TwelveTET(
    "quartal rainbow",
    "12tet quartal rainbow",
    twelveTetLayout.quartal.noteIndexAt,
    twelveTetColorMap.rainbow
  ),
  new TwelveTET(
    "halberstadt rainbow",
    "12tet halberstadt rainbow",
    twelveTetLayout.halberstadt.noteIndexAt,
    twelveTetColorMap.rainbow
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
