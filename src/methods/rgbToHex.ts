import { RGB } from "types";

export default function rgbToHex(color: RGB) {
  const red = ~~((color.red || 0.0) * 255),
    green = ~~((color.green || 0.0) * 255),
    blue = ~~((color.blue || 0.0) * 255);
  return (
    "#" + ((1 << 24) | (red << 16) | (green << 8) | blue).toString(16).slice(1)
  );
}
