import { reconcile } from "solid-js/store";
import {
  confessionMetadata,
  confessionSpreadsheet,
  setConfessionMetadata,
  setSheetInited,
} from "store/index";
import { CONFESSION_SHEET_TYPE_METADATA_KEY } from "../constants";
import { ConfessionSpreadsheetMetadata, SheetTypeKeys } from "types";
import checkSheetInited from "./checkSheetInited";
import { batch } from "solid-js";
import getLastRowPositionHasValue from "./getLastRowPositionHasValue";
import initFacebookPageMetadata from "./initFacebookPageMetadata";

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
    (
      [
        "pendingSheet",
        "acceptedSheet",
        "declinedSheet",
        "postedSheet",
      ] as SheetTypeKeys[]
    ).map((key) => {
      if (
        !confessionMetadata[key] ||
        sheetsMetadata![key]!.properties!.sheetId! !==
          confessionMetadata![key]!.properties!.sheetId!
      )
        getLastRowPositionHasValue(sheetsMetadata, key);
    });

    setConfessionMetadata(sheetsMetadata);
  } else {
    setConfessionMetadata(reconcile({}));
  }
  setSheetInited(checkSheetInited());
  initFacebookPageMetadata();
}
