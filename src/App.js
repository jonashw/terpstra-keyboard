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
import Switch from "@material-ui/core/Switch";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import qwertyMap from "./qwertyMap";
import toneMappings from "./toneMappings";

const doAutoFocus = true;
const autoInitAudio = false;

const initState = {
  currentMappingId: toneMappings.twelveTone.id,
  audioLoaded: false,
  optionsVisible: false,
  highlighted: {},
  showQwertyKeys: false
};

const Hexagon = ({ R }) => {
  let r = (Math.sqrt(3) * R) / 2;
  return {
    R,
    r,
    rowHeight: (R * 6) / 4
  };
};

const getKeys = ({ hex, rows, rowLength, startingOctave, currentMapping }) =>
  Array(rowLength)
    .fill()
    .flatMap((_, i) => {
      return Array(rows * 2)
        .fill()
        .map((_, j) => {
          let xOffset = j % 2 === 0 ? 0 : hex.r;
          let coord = [j, i];
          let y = hex.R + j * hex.rowHeight;
          let x = 2 * hex.r * i + hex.r + xOffset;
          let key = currentMapping.getKeyAt(startingOctave, coord);

          return {
            id: `${j}.${i}`,
            mapping: key,
            rowHeight: hex.rowHeight,
            x,
            y,
            qwertyKey: qwertyMap.coordToQwerty(coord),
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
  const [state, setState] = React.useState(initState);
  const [iw, ih] = useWindowSize();
  const [rows, setRows] = React.useState(3);
  const [startingOctave, setStartingOctave] = React.useState(4);
  const [keyboardRotation, setKeyboardRotation] = React.useState(0);

  const currentMapping = toneMappings.byId[state.currentMappingId];

  var keyHexagon = Hexagon({ R: iw / 23 });
  const keys = getKeys({
    hex: keyHexagon,
    currentMapping,
    rows,
    rowLength: 12,
    startingOctave
  });

  const htmlKeyLabel = toneMappings.htmlKeyLabelFn(currentMapping);

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

  const setKeyHighlight = (k, add1) => {
    playOctaveNote(k.mapping.octaveNote, add1);
  };

  const synth = React.useRef(null);

  const loadAudio = () => {
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    setState({ ...state, audioLoaded: true });
  };

  const isKeyHighlighted = (k) =>
    (state.highlighted[k.mapping.octaveNote] || 0) > 0;

  const highlightedKeys = keys.filter(isKeyHighlighted);

  const tryGetOctaveNoteQwertyNote = (e) => {
    let qk = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    let coord = qwertyMap.qwertyToCoord(qk);
    return currentMapping.getSynthToneAt(startingOctave, coord);
  };

  const playOctaveNote = (on, playing) => {
    let prevKeyDownCount = state.highlighted[on] || 0;
    let nextKeyDownCount = prevKeyDownCount + (playing ? 1 : -1);
    if (nextKeyDownCount === 0) {
      synth.current.triggerRelease([on], "8n");
    } else {
      if (prevKeyDownCount === 0 && nextKeyDownCount === 1) {
        synth.current.triggerAttack([on], 1);
      }
    }
    setState({
      ...state,
      highlighted: {
        ...state.highlighted,
        [on]: nextKeyDownCount
      }
    });
  };

  const trySetQwertyKeyPlaying = (e, playing) => {
    let on = tryGetOctaveNoteQwertyNote(e);
    console.log(e.key, e.code, on);

    if (!!on) {
      console.log(on);
      playOctaveNote(on, playing);
    } else {
      console.log(e.key, e.code);
    }
  };

  useEffect(() => {
    if (!state.audioLoaded && autoInitAudio) {
      loadAudio();
    }
  }, []);
  const options = [
    {
      type: "range",
      label: "Start at Octave",
      value: startingOctave,
      setFn: setStartingOctave,
      min: 1,
      max: 8
    },
    {
      type: "switch",
      label: "Show QWERTY keys",
      checked: !!state.showQwertyKeys,
      setFn: (sqk) => setState({ ...state, showQwertyKeys: !!sqk })
    },
    {
      type: "range",
      label: "Vertical Octaves",
      value: rows,
      setFn: setRows,
      min: 1,
      max: 6
    },
    {
      type: "range",
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
      {/*<pre>{JSON.stringify(playingState, null, 2)}</pre>*/}
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
              <ListItem>
                <FormControl>
                  <InputLabel id="tone-mapping-select">Key Mapping</InputLabel>
                  <Select
                    labelId="tone-mapping-select"
                    value={state.currentMappingId}
                    onChange={(e) =>
                      setState({ ...state, currentMappingId: e.target.value })
                    }
                  >
                    {toneMappings.all.map((m) => (
                      <MenuItem value={m.id}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ListItem>
              {options.map((o) => (
                <ListItem key={o.label}>
                  <Typography gutterBottom>{o.label}</Typography>
                  <br />
                  {(() => {
                    switch (o.type) {
                      case "switch":
                        return (
                          <Switch
                            checked={o.checked}
                            onChange={(e) => o.setFn(e.target.checked)}
                          />
                        );
                      case "range":
                        return (
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
                        );
                      default:
                        return "";
                    }
                  })()}
                </ListItem>
              ))}
            </List>
            {/*
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
            */}
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
                  const grad = (c, c2) => ({
                    fillRadialGradientStartPoint: { x: 0, y: 0 },
                    fillRadialGradientStartRadius: 0,
                    fillRadialGradientEndPoint: { x: 0, y: 0 },
                    fillRadialGradientEndRadius: key.R,
                    fillRadialGradientColorStops: [0, c, 0.7, c, 1, c2]
                  });

                  let fill = isKeyHighlighted(key)
                    ? grad("#3399ff", "#1177dd")
                    : key.mapping.color === "white"
                    ? grad("#ffffff", "#cccccc")
                    : grad("#555555", "#333333");
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
                        {...fill}
                        stroke={"#000000"}
                        strokeWidth={1}
                      />

                      <CenteredText
                        rotation={-keyboardRotation}
                        text={
                          !state.showQwertyKeys
                            ? key.mapping.label
                            : key.qwertyKey
                        }
                        fill={
                          key.mapping.color === "black" ? "#ffffff" : "#333333"
                        }
                      />
                    </Group>
                  );
                })}
              </Group>
            </Layer>
          </Stage>
          <div style={{ height: "1em", marginBottom: "1em" }}>
            {distinctBy(
              highlightedKeys.map((k) => k.mapping),
              (k) => k.octaveNote
            )
              .map((k, i) => htmlKeyLabel(k))
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
