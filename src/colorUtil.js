var convert = require("color-convert");

const darkenHex = (hex, d) => {
  let [h, s, l] = convert.hex.hsl(hex);
  return "#" + convert.hsl.hex(h, s, Math.max(l - d, 0));
};

const negativeHex = (hex) => {
  let [h, s, l] = convert.hex.hsl(hex);
  return "#" + convert.hsl.hex((h + 180) % 360, s, (l + 50) % 100);
};

const highContrastHex = (hex) => {
  let [h, s, l] = convert.hex.hsl(hex);

  return l <= 50 ? "#fff" : "#000";
};

export default { darkenHex, negativeHex, highContrastHex };
