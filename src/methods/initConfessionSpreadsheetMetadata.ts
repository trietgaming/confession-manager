import { reconcile } from "solid-js/store";
import {
  confessionSpreadsheet,
  setConfessionMetadata,
  setSheetInited,
} from "store/index";
import { CONFESSION_SHEET_TYPE_METADATA_KEY } from "../constants";
import { ConfessionSpreadsheetMetadata } from "types";
import { checkSheetInited } from "./checkSheetInited";

export default function initConfessionSpreadsheetMetadata(
  spreadsheet?: gapi.client.sheets.Spreadsheet
) {
  const sheetsMetadata: ConfessionSpreadsheetMetadata = {};
  if (!spreadsheet) spreadsheet = confessionSpreadsheet!;

  for (const sheet of spreadsheet!.sheets!) {
    if (!sheet.developerMetadata) continue;
    for (const metadata of sheet.developerMetadata) {
      if (metadata.metadataKey === CONFESSION_SHEET_TYPE_METADATA_KEY) {
        /// @ts-ignore
        sheetsMetadata[metadata.metadataValue] = sheet;
      }
    }
  }

  if (
    sheetsMetadata.acceptedSheet &&
    sheetsMetadata.declinedSheet &&
    sheetsMetadata.postedSheet &&
    sheetsMetadata.pendingSheet
  ) {
    setConfessionMetadata(sheetsMetadata);
  } else {
    setConfessionMetadata(reconcile({}));
  }
  setSheetInited(checkSheetInited());
}
