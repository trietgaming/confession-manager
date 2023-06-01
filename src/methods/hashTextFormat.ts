import { TextFormatObject } from "types";

export default function hashTextFormat({bold, italic, strikethrough, underline}: TextFormatObject) {
  // @ts-ignore
  return `${1&bold}${1&italic}${1&strikethrough}${1&underline}`;
}
