import React from "react";
import twelveToneMap from "./twelveToneMap";
import fourtyEightEDOToneMap from "./48edoMap";

import KeyMapping from "./KeyMapping";

let single = new KeyMapping("single note", "Single Note");

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
