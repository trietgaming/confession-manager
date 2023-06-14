import { confessionSpreadsheet } from "store/index";
import callAppScriptApi from "./callAppScriptApi";

export default async function getLastRowPositionHasValue(sheetName: string) {
  return (
    await callAppScriptApi("getLastRowPositionHasValue", [
      confessionSpreadsheet.spreadsheetId!,
      sheetName,
    ])
  ).data.response?.result;
}
