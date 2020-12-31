import React from "react";
import twelveToneMap from "./twelveToneMap";
import fourtyEightEDOToneMap from "./48edoMap";

import KeyMapping from "./KeyMapping";
class Single extends KeyMapping {
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

const all = [twelveToneMap, single, fourtyEightEDOToneMap];

const htmlKeyLabelFn = (currentMapping) => {
  if (currentMapping === twelveToneMap) {
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
  twelveTone: twelveToneMap,
  htmlKeyLabelFn,
  all: all,
  byId: all.reduce((dict, m) => {
    dict[m.id] = m;
    return dict;
  }, {})
};
