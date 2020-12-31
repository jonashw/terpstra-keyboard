import React from "react";
import twelveToneMap from "./twelveToneMap";
const all = [twelveToneMap];

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
