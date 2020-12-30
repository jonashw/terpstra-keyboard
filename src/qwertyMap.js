const rows = [
  {
    offset: 0,
    keys: "1234567890-="
  },
  {
    offset: 0,
    keys: "qwertyuiop[]\\"
  },
  {
    offset: 1,
    keys: "asdfghjkl;'"
  },
  {
    offset: 1,
    keys: "zxcvbnm,./"
  }
];

const qwertyToCoordDict = rows.reduce((map, r, y) => {
  for (let [x, k] of r.keys.split("").entries()) {
    map[k] = [y, r.offset + x];
  }
  return map;
}, {});

const qwertyToCoord = (q) => qwertyToCoordDict[q];

const coordToQwertyDict = rows.map((r) => [
  ...Array(r.offset),
  ...r.keys.split("")
]);

const coordToQwerty = (coord) => {
  if (!coord) {
    return undefined;
  }
  let [y, x] = coord;
  var r = coordToQwertyDict[y];
  if (!r) {
    return undefined;
  }
  return r[x];
};

export default { qwertyToCoord, coordToQwerty };
