import AppScriptApi from "controllers/AppScriptApi";
import { confessionSpreadsheet, sheetsLastRow } from "store/index";
import { ConfessionSpreadsheetMetadata, SheetTypeKeys } from "types";

/**
 * @deprecated
 */
export default async function getLastRowPositionHasValue(
  confessionMetadata: ConfessionSpreadsheetMetadata,
  sheetType: SheetTypeKeys
) {
  return (sheetsLastRow[sheetType] =
    await AppScriptApi.getLastRowPositionHasValue(
      confessionSpreadsheet.spreadsheetId!,
      confessionMetadata[sheetType]?.properties?.title!
    ));
}
