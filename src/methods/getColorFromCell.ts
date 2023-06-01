import Color from "classes/Color";
import { RGB, ThemeMap } from "types";

export default function getColorFromCell(
  style: gapi.client.sheets.ColorStyle,
  themeMap: ThemeMap
) {
  const cellRGBColor = style.rgbColor as RGB;

  const bgCellThemeColorType = style.themeColor;

  return bgCellThemeColorType
    ? themeMap[bgCellThemeColorType]
    : new Color(cellRGBColor);
}
