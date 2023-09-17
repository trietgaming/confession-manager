import {
  BASE_POST_SETTING_TEMPLATE_OBJ_KEYS,
  CONFESSION_SHEET_TYPE_METADATA_KEY,
} from "app-constants";
import initPostTemplates from "methods/initPostTemplates";
import {
  confessionMetadata,
  confessionSpreadsheet,
  confessions,
  hiddenConfessionRows,
  pendingChanges,
  pendingPost,
  resetPendingChanges,
  sheetsLastRow,
} from "store/index";
import { PendingChanges, PostTemplateSettings, SheetTypeKeys } from "types";
import AppSpreadsheetManager from "./AppSpreadsheetManager";
import { batch } from "solid-js";

const sheetTypeMap: { [key in keyof PendingChanges]: SheetTypeKeys } = {
    accepts: "acceptedSheet",
    cancels: "pendingSheet",
    declines: "declinedSheet",
    posts: "postedSheet",
  };

export default class ConfessionsManager {
  static clearAll() {
    for (const key in confessions) {
      confessions[key as keyof typeof confessions] = [[], []];
    }
  }

  static async createNewPostTemplate(template: PostTemplateSettings) {
    if (!template._name) return;

    if (!confessionMetadata.postSettingTemplatesSheet) {
      const addSheetResponse =
        await gapi.client.sheets.spreadsheets.batchUpdate(
          {
            spreadsheetId: confessionSpreadsheet.spreadsheetId!,
          },
          {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: "_CONFESSION_MANAGER_SAVED_POST_TEMPLATE",
                    hidden: true,
                    gridProperties: {
                      rowCount: 1,
                    },
                  },
                },
              },
            ],
          }
        );

      await AppSpreadsheetManager.updateMetadata([
        {
          key: CONFESSION_SHEET_TYPE_METADATA_KEY,
          value: "postSettingTemplatesSheet",
          sheet: addSheetResponse.result.replies![0]
            .addSheet as gapi.client.sheets.Sheet,
        },
      ]);
    }

    await AppSpreadsheetManager.refresh(
      (
        await gapi.client.sheets.spreadsheets.batchUpdate(
          {
            spreadsheetId: confessionSpreadsheet.spreadsheetId!,
          },
          {
            includeSpreadsheetInResponse: true,
            requests: [
              {
                appendDimension: {
                  dimension: "ROWS",
                  sheetId:
                    confessionMetadata.postSettingTemplatesSheet?.properties
                      ?.sheetId,
                  length: 1,
                },
              },
              {
                appendCells: {
                  sheetId:
                    confessionMetadata.postSettingTemplatesSheet?.properties
                      ?.sheetId,
                  rows: [
                    {
                      values: BASE_POST_SETTING_TEMPLATE_OBJ_KEYS.map(
                        (key): gapi.client.sheets.CellData => ({
                          userEnteredValue: {
                            stringValue: `${template[key] || ""}`,
                          },
                        })
                      ),
                    },
                  ],
                  fields: "userEnteredValue",
                },
              },
            ],
          }
        )
      ).result.updatedSpreadsheet
    );
    await initPostTemplates();
  }

  static async savePendingChanges() {
    const sheetMap: {
      [key in keyof PendingChanges]: number; // SheetId
    } = {
      accepts: confessionMetadata.acceptedSheet?.properties?.sheetId!,
      cancels: confessionMetadata.pendingSheet?.properties?.sheetId!,
      declines: confessionMetadata.declinedSheet?.properties?.sheetId!,
      posts: confessionMetadata.postedSheet?.properties?.sheetId!,
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
  
      if (sheetTypeMap[changeKey as keyof PendingChanges] === "pendingSheet") {
        batchRequests.push({
          insertDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: 1,
              endIndex: rows.length + 1,
            },
          },
        });
        batchRequests.push({
          updateCells: {
            fields: "userEnteredValue",
            rows,
            start: {
              rowIndex: 1,
              sheetId,
            },
          },
        });
      } else {
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
      }
  
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
        if (a.appendCells || a.updateCells) return 1;
        return -1;
      });
      // console.log(batchRequests);
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
      ConfessionsManager.clearAll();
      resetPendingChanges();
    });
  }
}
