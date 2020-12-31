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
  let [r, g, b] = convert.hex.rgb(hex);
  let pl =
    // Counting the perceptive luminance - human eye favors green color...
    //source: https://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
    (100 * (0.299 * r + 0.587 * g + 0.114 * b)) / 255;

  return pl <= 50 ? "#fff" : "#000";
};

const rainbow = (n, offset) =>
  Array(n)
    .fill()
    .map((_, i) => ((offset || 0) + (i * 360) / n) % 360)
    .map((h) => "#" + convert.hsl.hex(h, 100, 60));

export default { darkenHex, negativeHex, highContrastHex, rainbow };
