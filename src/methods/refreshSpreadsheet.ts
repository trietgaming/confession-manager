import { reconcile } from "solid-js/store";
import { batch } from "solid-js";
import { confessionSpreadsheet, setConfessionSpreadsheet } from "store/index";
import initConfessionSpreadsheetMetadata from "./initConfessionSpreadsheetMetadata";

export default async function refreshSpreadsheet(
  updatedConfessionSpreadsheet: gapi.client.sheets.Spreadsheet | null = null
) {
  await batch(async () => {
    setConfessionSpreadsheet(
      reconcile(
        updatedConfessionSpreadsheet ||
          (
            await gapi.client.sheets.spreadsheets.get({
              spreadsheetId: confessionSpreadsheet!.spreadsheetId!,
            })
          ).result
      )
    );
    initConfessionSpreadsheetMetadata();
  });
}
