import { TextFormatObject } from "types";

export function columnToLetter(column: number) {
  let temp,
    letter = "";
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

export function hashTextFormat({bold, italic, strikethrough, underline}: TextFormatObject) {
  // @ts-ignore
  return `${1&bold}${1&italic}${1&strikethrough}${1&underline}`;
}

export function unhashTextFormat(hash: string): TextFormatObject {
  return {
    bold: hash[0] === "1",
    italic: hash[1] === "1",
    strikethrough: hash[2] === "1",
    underline: hash[3] === "1",
  };
}

