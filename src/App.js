import React from "react";
import "./styles.css";
import * as Tone from "tone";
import { Stage, Layer, RegularPolygon, Group } from "react-konva";
import distinctBy from "./distinctBy";
import CenteredText from "./konva.centered-text.js";
import useWindowSize from "./useWindowSize";

const doAutoFocus = false;
const twelveTone = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
  "C"
];

let qwertyRows = [
  [
    "`",
    "1",
    "`",
    "2",
    "`",
    "3",
    "`",
    "4",
    "`",
    "5",
    "`",
    "6",
    "`",
    "7",
    "`",
    "8",
    "`",
    "9",
    "`",
    "0",
    "`",
    "-",
    "`",
    "="
  ],
  [
    "q",
    "a",
    "w",
    "s",
    "e",
    "d",
    "r",
    "f",
    "t",
    "g",
    "y",
    "h",
    "u",
    "j",
    "i",
    "k",
    "o",
    "l",
    "p",
    ";",
    "[",
    "'",
    "]",
    "Enter",
    "\\"
  ],
  [
    "ShiftLeft",
    "AltLeft",
    "z",
    "MetaLeft",
    "x",
    "`",
    "c",
    "`",
    "v",
    "`",
    "b",
    "`",
    "n",
    "`",
    "m",
    "`",
    ",",
    "`",
    ".",
    "`",
    "/",
    "ShiftRight"
  ]
];

const Hexagon = (R) => {
  let r = (Math.sqrt(3) * R) / 2;
  return {
    R,
    r,
    rowHeight: (R - r) * 11
  };
};

const keyColors = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
const getKeys = (hex) =>
  Array(25)
    .fill()
    .flatMap((c, i) => {
      let yOffset = hex.rowHeight * (i % 2);
      let octave = 4 + Math.floor(i / 12);
      let note = twelveTone[i % 12];
      return [0, 1, 2].map((j) => ({
        id: `${i}.${j}`,
        note,
        letter: note[0],
        rowHeight: hex.rowHeight,
        accidental: note.length === 2 ? note[1] : "",
        octaveNote: `${note}${octave}`,
        color: keyColors[i % keyColors.length] === 0 ? "black" : "white",
        x: hex.r * i + hex.r,
        y: hex.R + yOffset + j * hex.rowHeight * 2,
        octave,
        r: hex.r,
        R: hex.R
      }));
    });

export default function App() {
  const [iw, ih] = useWindowSize();
  var keyHexagon = Hexagon(iw / 23.5);
  const keys = getKeys(keyHexagon);
  const keyboardRotation = -10;
  const stageHeight = ((d) => d + Math.cos(keyboardRotation * Math.PI) * 500)(
    keys[0].rowHeight * 6.5
  );
  const keyboardLength = "TODO";

  const [state, setState] = React.useState({
    audioLoaded: false,
    highlighted: {}
  });

  const setKeyHighlight = (k, add1) => {
    let h = Math.max((state.highlighted[k.octaveNote] || 0) + (add1 ? 1 : -1));
    setState({
      ...state,
      highlighted: { ...state.highlighted, [k.octaveNote]: h }
    });
    playOctaveNote(k.octaveNote, add1);
  };

  const synth = React.useRef(null);

  const loadAudio = () => {
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    setState({ ...state, audioLoaded: true });
  };

  const isKeyHighlighted = (k) => (state.highlighted[k.octaveNote] || 0) > 0;

  const highlightedKeys = keys.filter(isKeyHighlighted);

  const tryGetOctaveNoteQwertyNote = (e) => {
    let qk = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    let i = qwertyRows
      .map((row) => Math.max(row.indexOf(qk), row.indexOf(e.code)))
      .filter((i) => i >= 0)[0];
    if (!isNaN(i) && 0 <= i) {
      let tone = twelveTone[i % 12];
      let octave = Math.floor(i / 12) + 4;
      return `${tone}${octave}`;
    }
    return undefined;
  };

  const playOctaveNote = (on, playing) => {
    if (!playing) {
      synth.current.triggerRelease([on], 1);
    } else {
      if ((state.highlighted[on] || 0) === 0) {
        synth.current.triggerAttack([on], 1);
      }
    }
  };

  const trySetQwertyKeyPlaying = (e, playing) => {
    let on = tryGetOctaveNoteQwertyNote(e);
    console.log(e.key, e.code, on);

    if (!!on) {
      console.log(on);
      playOctaveNote(on, playing);
      setState({
        ...state,
        highlighted: {
          ...state.highlighted,
          [on]: playing
        }
      });
    } else {
      console.log(e.key, e.code);
    }
  };

  const yOffset = 0; //80;
  return (
    <div>
      {state.audioLoaded ? (
        <div
          ref={(input) => doAutoFocus && input && input.focus()}
          autoFocus
          tabIndex="0"
          onKeyDown={(e) => trySetQwertyKeyPlaying(e, true)}
          onKeyUp={(e) => trySetQwertyKeyPlaying(e, false)}
        >
          {/* 
          <pre>{JSON.stringify(highlightedKeys,null,2)}</pre>
          */}

          <Stage width={iw} height={stageHeight}>
            <Layer rotation={keyboardRotation} y={yOffset}>
              {keys.map((key) => {
                return (
                  <Group
                    key={key.id}
                    x={key.x + 1}
                    y={key.y + 2}
                    onMouseOver={() => setKeyHighlight(key, true)}
                    onMouseOut={() => setKeyHighlight(key, false)}
                    onTouchStart={() => setKeyHighlight(key, true)}
                    onTouchEnd={() => setKeyHighlight(key, false)}
                  >
                    <RegularPolygon
                      sides={6}
                      radius={key.R}
                      fill={
                        isKeyHighlighted(key)
                          ? "green"
                          : key.color === "white"
                          ? "#ffffff"
                          : "#333333"
                      }
                      stroke={key.color === "black" ? "#000000" : "#000000"}
                      strokeWidth={1}
                    />
                    {/*
                    <Circle
                      radius={5}
                      fill={key.color === "black" ? "#ffffff" : "#000000"}
                    />
                    */}
                    <CenteredText
                      rotation={-keyboardRotation}
                      text={key.octaveNote}
                      offsetX={10}
                      offsetY={5}
                      fill={key.color === "black" ? "#ffffff" : "#333333"}
                    />
                  </Group>
                );
              })}
            </Layer>
          </Stage>
          <div style={{ height: "1em", marginBottom: "1em" }}>
            {distinctBy(highlightedKeys, (k) => k.octaveNote)
              .map((k, i) => (
                <span key={k.octaveNote}>
                  <span>{k.letter}</span>
                  <sup>{k.accidental}</sup>
                  <sub>{k.octave}</sub>
                </span>
              ))
              .reduce((acc, k) => (acc == null ? [k] : [acc, " + ", k]), null)}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={loadAudio} className="btn btn-lg btn-block">
            Load
          </button>
        </div>
      )}
    </div>
  );
}
