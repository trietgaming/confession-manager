import { RGB } from "types";
import { hexToRgb, rgbToHex } from "utils/color";

export default class Color {
  public hex: string;
  public rgb: RGB;
  constructor(c: RGB | string) {
    if (typeof c === "string") {
      this.hex = c;
      this.rgb = hexToRgb(c) || {};
    } else {
      this.hex = rgbToHex(c);
      this.rgb = c;
    }
  }
}