import React, { useEffect } from "react";
import "./styles.css";
import * as Tone from "tone";
import { Stage, Layer, RegularPolygon, Group } from "react-konva";
import distinctBy from "./distinctBy";
import CenteredText from "./konva.centered-text.js";
import useWindowSize from "./useWindowSize";
import Fab from "@material-ui/core/Fab";
import SettingsIcon from "@material-ui/icons/Settings";
import MusicNoteIcon from "@material-ui/icons/MusicNote";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

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
    rowHeight: (R * 6) / 4
  };
};

const keyColors = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
const getKeys = (hex, rows) =>
  Array(25)
    .fill()
    .flatMap((c, i) => {
      let yOffset = hex.rowHeight * (i % 2);
      let octave = 4 + Math.floor(i / 12);
      let note = twelveTone[i % 12];
      return Array(rows)
        .fill()
        .map((_, j) => {
          let y = hex.R + yOffset + j * hex.rowHeight * 2;
          let x = hex.r * i + hex.r;
          return {
            id: `${i}.${j}`,
            note,
            letter: note[0],
            rowHeight: hex.rowHeight,
            accidental: note.length === 2 ? note[1] : "",
            octaveNote: `${note}${octave}`,
            color: keyColors[i % keyColors.length] === 0 ? "black" : "white",
            x,
            y,
            octave,
            r: hex.r,
            R: hex.R,
            top: y - hex.R,
            bottom: y + hex.R,
            left: x - hex.R,
            right: x + hex.R
          };
        });
    });

import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

export default function App() {
  const [iw, ih] = useWindowSize();
  const [rows, setRows] = React.useState(3);
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);
  const [keyboardRotation, setKeyboardRotation] = React.useState(0);
  var keyHexagon = Hexagon(iw / 23);
  const keys = getKeys(keyHexagon, rows);

  const [boardHeight, boardWidth] = keys.reduce(
    ([h, w], k) => [Math.max(h, k.bottom), Math.max(w, k.right)],
    [0, 0]
  );
  const [boardDiagonalHeight, boardDiagonalWidth] = [
    boardHeight +
      Math.abs(boardWidth * 2 * Math.sin(Math.PI * keyboardRotation)),
    boardWidth
  ];
  const offsetY = 0;

  const [state, setState] = React.useState({
    audioLoaded: false,
    optionsVisible: false,
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

  useEffect(() => {
    if (!state.audioLoaded) {
      //loadAudio();
    }
  }, []);
  const options = [
    {
      label: "Vertical Octaves",
      value: rows,
      setFn: setRows,
      min: 1,
      max: 6
    },
    {
      label: "Rotation",
      value: keyboardRotation,
      setFn: setKeyboardRotation,
      min: -15,
      max: 15
    }
  ];
  const variables = [
    {
      label: "Keyboard Width",
      value: boardWidth.toFixed(2)
    },
    {
      label: "Keyboard Height",
      value: boardHeight.toFixed(2)
    },
    {
      label: "Keyboard Diagonal Width",
      value: boardDiagonalWidth.toFixed(2)
    },
    {
      label: "Keyboard Diagonal Height",
      value: boardDiagonalHeight.toFixed(2)
    }
  ];
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
          <Fab
            color="primary"
            aria-label="settings"
            onClick={(e) => {
              setState({ ...state, optionsVisible: true });
            }}
            style={{
              zIndex: 100,
              position: "absolute",
              left: "16px",
              bottom: "16px"
            }}
          >
            <SettingsIcon />
          </Fab>
          <Drawer
            anchor={"bottom"}
            open={state.optionsVisible}
            onClose={() => setState({ ...state, optionsVisible: false })}
          >
            <List>
              <ListItem key="Title">
                <Typography variant="h6" gutterBottom>
                  SETTINGS
                </Typography>
                <ListItemSecondaryAction>
                  <Button
                    onClick={() => {
                      setState({ ...state, optionsVisible: false });
                    }}
                  >
                    <CloseIcon />
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              {options.map((o) => (
                <ListItem key={o.label}>
                  <Typography gutterBottom>{o.label}</Typography>
                  <br />
                  <Slider
                    defaultValue={o.value}
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    onChange={(e, newValue) => {
                      o.setFn(newValue);
                    }}
                    marks
                    min={o.min}
                    max={o.max}
                  />
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
              {variables.map((v) => (
                <ListItem>
                  <ListItemText primary={v.label} />
                  <ListItemSecondaryAction>
                    <Typography>{v.value}</Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Drawer>
          {/* 
          <pre>{JSON.stringify(highlightedKeys,null,2)}</pre>
          */}
          <Stage width={boardWidth} height={boardHeight + 3}>
            <Layer>
              <Group
                rotation={keyboardRotation}
                x={boardDiagonalWidth / 2}
                y={boardDiagonalHeight / 2 + offsetY}
                offsetX={boardDiagonalWidth / 2}
                offsetY={boardDiagonalHeight / 2}
              >
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
              </Group>
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100vh",
            justifyContent: "center"
          }}
        >
          <Button
            size="large"
            variant="outlined"
            color="primary"
            onClick={loadAudio}
          >
            <MusicNoteIcon />
            Play
          </Button>
        </div>
      )}
    </div>
  );
}
