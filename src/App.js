import React, { useEffect } from "react";
import "./styles.css";
import * as Tone from "tone";
import { Text, Stage, Layer, RegularPolygon, Group } from "react-konva";
import useWindowSize from "./useWindowSize";

import MusicNoteIcon from "@material-ui/icons/MusicNote";

import ColorUtil from "./colorUtil";
import Button from "@material-ui/core/Button";
import qwertyMap from "./qwertyMap";
import toneMappings from "./toneMappings";
import SettingsDrawer from "./SettingsDrawer";
const doAutoFocus = true;
const autoInitAudio = false;

const initState = {
  currentMappingId: toneMappings.twelveTone.id,
  audioLoaded: false,
  optionsVisible: false,
  highlighted: {},
  showQwertyKeys: false,
  qwertyDown: {},
  downKeyIds: {}
};

const Hexagon = ({ R }) => {
  let r = (Math.sqrt(3) * R) / 2;
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

export default function App() {
  const [state, setState] = React.useState(initState);
  const [iw, ih] = useWindowSize();
  const [rows, setRows] = React.useState(3);
  const [startingOctave, setStartingOctave] = React.useState(4);
  const [keyboardRotation, setKeyboardRotation] = React.useState(0);
  const setCurrentMappingId = (id) =>
    setState({ ...state, currentMappingId: id });

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
    let k = currentMapping.getKeyAt(startingOctave, coord);

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
      options: toneMappings.all.map((m) => ({
        value: m.id,
        label: m.label
      }))
    },
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
  const setOptionsVisible = (v) => setState({ ...state, optionsVisible: v });

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
              setOptionsVisible,
              optionsVisible: state.optionsVisible
            }}
          />

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
                        rotation={-keyboardRotation}
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
