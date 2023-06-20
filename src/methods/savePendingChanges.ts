import { batch } from "solid-js";
import {
  confessionMetadata,
  pendingChanges,
  sheetsLastRow,
  confessionSpreadsheet,
  hiddenConfessionRows,
  pendingPost,
  resetPendingChanges,
} from "store/index";
import { PendingChanges, SheetTypeKeys } from "types";
import resetConfessions from "./resetConfessions";

export default async function savePendingChanges() {
  const sheetMap: {
    [key in keyof PendingChanges]: number; // SheetId
  } = {
    accepts: confessionMetadata.acceptedSheet?.properties?.sheetId!,
    cancels: confessionMetadata.pendingSheet?.properties?.sheetId!,
    declines: confessionMetadata.declinedSheet?.properties?.sheetId!,
    posts: confessionMetadata.postedSheet?.properties?.sheetId!,
  };
  const sheetTypeMap: { [key in keyof PendingChanges]: SheetTypeKeys } = {
    accepts: "acceptedSheet",
    cancels: "pendingSheet",
    declines: "declinedSheet",
    posts: "postedSheet",
  };
  const batchRequests: gapi.client.sheets.Request[] = [];

  for (const changeKey in pendingChanges) {
    const confesisons = pendingChanges[changeKey as keyof PendingChanges];
    if (!confesisons || confesisons.length === 0) continue;

    const sheetId = sheetMap[changeKey as keyof PendingChanges];

    const rows: gapi.client.sheets.RowData[] = [];

    for (let i = 0, n = confesisons.length; i < n; ++i) {
      const confession = confesisons[i];
      const row: gapi.client.sheets.CellData[] = confession.raw.map((val) => ({
        userEnteredValue: {
          stringValue: val,
        },
      }));

      batchRequests.push({
        deleteDimension: {
          range: {
            dimension: "ROWS",
            sheetId: confession.in.properties?.sheetId!,
            startIndex: confession.row - 1, // this is 0-based index but confession.row is 1-based
            endIndex: confession.row,
          },
        },
      });
      if (confession.in === confessionMetadata.pendingSheet)
        sheetsLastRow.pendingSheet && (sheetsLastRow.pendingSheet -= 1);
      if (confession.in === confessionMetadata.acceptedSheet)
        sheetsLastRow.acceptedSheet && (sheetsLastRow.acceptedSheet -= 1);
      if (confession.in === confessionMetadata.declinedSheet)
        sheetsLastRow.declinedSheet && (sheetsLastRow.declinedSheet -= 1);

      rows.push({
        values: row,
      });
    }

    batchRequests.push({
      appendDimension: {
        sheetId,
        length: rows.length,
        dimension: "ROWS",
      },
    });
    batchRequests.push({
      appendCells: {
        sheetId,
        rows,
        fields: "userEnteredValue",
      },
    });
    if (
      typeof sheetsLastRow[
        sheetTypeMap[changeKey as keyof PendingChanges] as SheetTypeKeys
      ] === "number"
    )
      sheetsLastRow[
        sheetTypeMap[changeKey as keyof PendingChanges] as SheetTypeKeys
      ]! += rows.length;
  }
  if (batchRequests.length) {
    batchRequests.sort((a, b) => {
      if (a.deleteDimension && b.deleteDimension)
        return (
          b.deleteDimension.range!.startIndex! -
          a.deleteDimension.range!.startIndex!
        );
      if (a.appendCells) return 1;
      return -1;
    });
    try {
      await gapi.client.sheets.spreadsheets.batchUpdate(
        {
          spreadsheetId: confessionSpreadsheet.spreadsheetId!,
        },
        {
          includeSpreadsheetInResponse: false,
          requests: batchRequests,
        }
      );
    } catch (err) {
      alert("Đã có lỗi xảy ra");
      console.error(err);
    }
  }
  batch(() => {
    hiddenConfessionRows.hidden = {};
    pendingPost.length = 0;
    resetConfessions();
    resetPendingChanges();
  });
}
