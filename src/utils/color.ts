import Color from "models/Color";
import { RGB, ThemeMap } from "types";

export function rgbToHex(color: RGB) {
  const red = ~~((color.red || 0.0) * 255),
    green = ~~((color.green || 0.0) * 255),
    blue = ~~((color.blue || 0.0) * 255);
  return (
    "#" + ((1 << 24) | (red << 16) | (green << 8) | blue).toString(16).slice(1)
  );
}

export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: Math.round(((parseInt(result[1], 16) / 255) * 1e8)) / 1e8,
        green: Math.round(((parseInt(result[2], 16) / 255) * 1e8)) / 1e8,
        blue: Math.round(((parseInt(result[3], 16) / 255) * 1e8)) / 1e8,
      }
    : null;
}

export function getColorFromCell(
  style: gapi.client.sheets.ColorStyle,
  themeMap: ThemeMap
) {
  const cellRGBColor = style.rgbColor as RGB;

  const bgCellThemeColorType = style.themeColor;

  return bgCellThemeColorType
    ? themeMap[bgCellThemeColorType]
    : new Color(cellRGBColor);
}