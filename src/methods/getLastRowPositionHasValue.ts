import { confessionSpreadsheet, sheetsLastRow } from "store/index";
import callAppScriptApi from "./callAppScriptApi";
import { ConfessionSpreadsheetMetadata, SheetTypeKeys } from "types";

export default async function getLastRowPositionHasValue(
  confessionMetadata: ConfessionSpreadsheetMetadata,
  sheetType: SheetTypeKeys
) {
  return (sheetsLastRow[sheetType] = (
    await callAppScriptApi("getLastRowPositionHasValue", [
      confessionSpreadsheet.spreadsheetId!,
      confessionMetadata[sheetType]?.properties?.title!,
    ])
  ).data.response?.result);
}
