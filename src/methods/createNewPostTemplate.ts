import {
  BASE_POST_SETTING_TEMPLATE_OBJ_KEYS,
  CONFESSION_SHEET_TYPE_METADATA_KEY,
} from "app-constants";
import { confessionMetadata, confessionSpreadsheet } from "store/index";
import { PostTemplateSettings } from "types";
import initPostTemplates from "./initPostTemplates";
import refreshSpreadsheet from "./refreshSpreadsheet";
import updateSpreadsheetMetadata from "./updateSpreadsheetMetadata";

export default async function createNewPostTemplate(
  template: PostTemplateSettings
) {
  if (!template._name) return;

  if (!confessionMetadata.postSettingTemplatesSheet) {
    const addSheetResponse = await gapi.client.sheets.spreadsheets.batchUpdate(
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

    await updateSpreadsheetMetadata([
      {
        key: CONFESSION_SHEET_TYPE_METADATA_KEY,
        value: "postSettingTemplatesSheet",
        sheet: addSheetResponse.result.replies![0]
          .addSheet as gapi.client.sheets.Sheet,
      },
    ]);
  }

  await refreshSpreadsheet(
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
