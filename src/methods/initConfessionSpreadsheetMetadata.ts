import { confessionSpreadsheet, setConfessionMetadata } from "store/index";
import { CONFESSION_SHEET_TYPE_METADATA_KEY } from "../constants";
import { ConfessionSpreadsheetMetadata } from "types";

export default function initConfessionSpreadsheetMetadata() {
  const sheetsMetadata: ConfessionSpreadsheetMetadata = {};

  for (const sheet of confessionSpreadsheet!.sheets!) {
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
  }
}
