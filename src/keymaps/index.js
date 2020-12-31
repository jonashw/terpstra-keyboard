import React from "react";
import twelveEDO from "./12edo";
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

const all = [twelveEDO, single, fourtyEightEDO];

const htmlKeyLabelFn = (currentMapping) => {
  if (currentMapping === twelveEDO) {
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
