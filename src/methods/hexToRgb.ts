import { RGB } from "types";

export default function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: Math.round(((parseInt(result[1], 16) / 255) * 1e8)) / 1e8,
        green: Math.round(((parseInt(result[2], 16) / 255) * 1e8)) / 1e8,
        blue: Math.round(((parseInt(result[3], 16) / 255) * 1e8)) / 1e8,
      }
    : null;
}
