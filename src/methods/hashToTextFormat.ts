import { TextFormatObject } from "types";

export default function hashToTextFormat(hash: string): TextFormatObject {
  return {
    bold: hash[0] === "1",
    italic: hash[1] === "1",
    strikethrough: hash[2] === "1",
    underline: hash[3] === "1",
  };
}
