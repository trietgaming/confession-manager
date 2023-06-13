import {
  confesisonForm,
  confessionSpreadsheet,
  setConfessionSpreadsheet,
} from "store/index";
import fetchAndInitSpreadsheet from "./fetchAndInitSpreadsheet";

export default async function refreshSpreadsheet(
  updatedConfessionSpreadsheet?: gapi.client.sheets.Spreadsheet
) {
  return updatedConfessionSpreadsheet
    ? await fetchAndInitSpreadsheet({
        updatedSpreadsheet: updatedConfessionSpreadsheet,
      })
    : await fetchAndInitSpreadsheet({
        spreadsheetId: confessionSpreadsheet.spreadsheetId,
        formId: confesisonForm.formId,
      });
}
