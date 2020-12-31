import React, { useEffect } from "react";
import "./styles.css";
import * as Tone from "tone";
import { Text, Stage, Layer, RegularPolygon, Group } from "react-konva";
import useWindowSize from "./useWindowSize";

import MusicNoteIcon from "@material-ui/icons/MusicNote";

import ColorUtil from "./colorUtil";
import Button from "@material-ui/core/Button";
import qwertyMap from "./qwertyMap";
import keymaps from "./keymaps";
import SettingsDrawer from "./SettingsDrawer";
const doAutoFocus = false;
const autoInitAudio = true;

const initState = {
  currentMappingId: keymaps.all[0].id,
  audioLoaded: false,
  optionsVisible: false,
  highlighted: {},
  showQwertyKeys: false,
  qwertyDown: {},
  downKeyIds: {},
  rows: 9,
  rowLength: 14,
  rotation: 0,
  startingOctave: 4
};

const Hexagon = ({ R, r }) => {
  if (!isNaN(R)) {
    r = (Math.sqrt(3) * R) / 2;
  } else if (!isNaN(r)) {
    R = (2 * r) / Math.sqrt(3);
  } else {
    throw Error("expected numeric value or r or R");
  }
  return {
    R,
    r,
    d: 2 * r,
    D: 2 * R,
    rowHeight: (R * 6) / 4
  };
};

const getKeys = ({ hex, rows, rowLength, startingOctave, currentMapping }) =>
  Array(rowLength)
    .fill()
    .flatMap((_, i) => {
      return Array(rows)
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

export default function App() {
  const [state, setState] = React.useState(initState);
  const [iw, ih] = useWindowSize();
  const setCurrentMappingId = (id) =>
    setState({ ...state, currentMappingId: id });

  const currentMapping = keymaps.byId[state.currentMappingId];

  var keyHexagon = Hexagon({ r: iw / (1 + state.rowLength * 2) });
  const keys = getKeys({
    hex: keyHexagon,
    currentMapping,
    rows: state.rows,
    rowLength: state.rowLength,
    startingOctave: state.startingOctave
  });

  const htmlKeyLabel = keymaps.htmlKeyLabelFn(currentMapping);

  const [boardHeight, boardWidth] = keys.reduce(
    ([h, w], k) => [Math.max(h, k.bottom), Math.max(w, k.right)],
    [0, 0]
  );
  const [boardDiagonalHeight, boardDiagonalWidth] = [
    boardHeight + Math.abs(boardWidth * 2 * Math.sin(Math.PI * state.rotation)),
    boardWidth
  ];
  const offsetY = 0;

  const synth = React.useRef(null);

  const loadAudio = () => {
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    setState({ ...state, audioLoaded: true });
  };

  const setKeyHighlight = (k, add1) => {
    play(k.mapping, add1);
  };

  const isKeyHighlighted = (k) =>
    (state.highlighted[k.mapping.synthTone] || 0) > 0;
  const isKeyDown = (k) => !!state.downKeyIds[k.mapping.id];

  const play = (k, playing) => {
    let st = k.synthTone;
    if (playing && k.id in state.downKeyIds) {
      return;
    }
    let downKeyIds = { ...state.downKeyIds };
    let prevKeyDownCount = state.highlighted[st] || 0;
    let nextKeyDownCount = prevKeyDownCount + (playing ? 1 : -1);
    if (nextKeyDownCount === 0) {
      synth.current.triggerRelease([st]);
      delete downKeyIds[k.id];
    } else {
      if (prevKeyDownCount === 0 && nextKeyDownCount === 1) {
        synth.current.triggerAttack([st]);
        downKeyIds[k.id] = true;
      }
    }
    setState({
      ...state,
      downKeyIds,
      highlighted: {
        ...state.highlighted,
        [st]: nextKeyDownCount
      }
    });
  };

  const trySetQwertyKeyPlaying = (e, playing) => {
    let qwerty = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    let coord = qwertyMap.qwertyToCoord(qwerty);
    let k = currentMapping.getKeyAt(state.startingOctave, coord);

    if (!!k) {
      play(k, playing);
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
      type: "select",
      label: "Key Mapping",
      id: "key-mapping-select",
      value: state.currentMappingId,
      setFn: setCurrentMappingId,
      options: keymaps.all.map((m) => ({
        value: m.id,
        label: m.label
      }))
    },
    {
      type: "range",
      label: "Start at Octave",
      value: state.startingOctave,
      setFn: (so) => setState({ ...state, startingOctave: so }),
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
      label: "Rows",
      value: state.rows,
      setFn: (r) => setState({ ...state, rows: r }),
      min: 1,
      max: 10
    },
    {
      type: "range",
      label: "Rotation",
      value: state.rotation,
      setFn: (r) => setState({ ...state, rotation: r }),
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

  const downKeys = keys.filter(isKeyDown);

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
          <SettingsDrawer
            {...{
              options,
              variables,
              setOptionsVisible: (v) =>
                setState({ ...state, optionsVisible: v }),
              optionsVisible: state.optionsVisible
            }}
          />

          <Stage width={boardWidth} height={boardHeight + 3}>
            <Layer>
              <Group
                rotation={state.rotation}
                x={boardDiagonalWidth / 2}
                y={boardDiagonalHeight / 2 + offsetY}
                offsetX={boardDiagonalWidth / 2}
                offsetY={boardDiagonalHeight / 2}
              >
                {keys.map((key) => {
                  const grad = (c) => ({
                    fillRadialGradientStartPoint: { x: 0, y: 0 },
                    fillRadialGradientStartRadius: 0,
                    fillRadialGradientEndPoint: { x: 0, y: 0 },
                    fillRadialGradientEndRadius: key.R,
                    fillRadialGradientColorStops: [
                      0,
                      c,
                      0.7,
                      c,
                      1,
                      ColorUtil.darkenHex(c, 30)
                    ]
                  });

                  let fillColor = isKeyDown(key)
                    ? "#3399ff"
                    : isKeyHighlighted(key)
                    ? "#33ff99"
                    : key.mapping.color;

                  let fill = grad(fillColor);
                  return (
                    <Group
                      key={key.id}
                      x={key.x + 1}
                      y={key.y + 2}
                      onMouseEnter={() => setKeyHighlight(key, true)}
                      onMouseLeave={() => setKeyHighlight(key, false)}
                      onTouchStart={() => setKeyHighlight(key, true)}
                      onTouchEnd={() => setKeyHighlight(key, false)}
                    >
                      <RegularPolygon
                        sides={6}
                        radius={keyHexagon.R}
                        {...fill}
                        stroke={"#000000"}
                        strokeWidth={1}
                      />

                      <Text
                        x={-keyHexagon.r}
                        y={-keyHexagon.r}
                        width={keyHexagon.d}
                        height={keyHexagon.d}
                        align="center"
                        verticalAlign="middle"
                        rotation={-state.rotation}
                        fontSize={(2 * keyHexagon.r) / 3}
                        text={
                          !state.showQwertyKeys
                            ? key.mapping.label
                            : key.qwertyKey
                        }
                        fill={ColorUtil.highContrastHex(fillColor)}
                      />
                    </Group>
                  );
                })}
              </Group>
            </Layer>
          </Stage>
          <div style={{ height: "1em", marginBottom: "1em" }}>
            {downKeys
              .map((k, i) => htmlKeyLabel(k.mapping))
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
