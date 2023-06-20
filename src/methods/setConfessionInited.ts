import {
  IS_SHEETS_INITED_METADATA_KEY,
  SHEETS_INITED_TYPES,
} from "app-constants";
import { confessionSpreadsheet } from "store/index";

export default async function setConfessionInited(
  initType: SHEETS_INITED_TYPES,
  init: boolean = true
) {
  if (
    confessionSpreadsheet.developerMetadata &&
    confessionSpreadsheet.developerMetadata.some(
      (metadata) =>
        metadata.metadataKey === IS_SHEETS_INITED_METADATA_KEY &&
        metadata.metadataValue === initType
    )
  ) {
    if (init) {
      return confessionSpreadsheet;
    }
    return (
      await gapi.client.sheets.spreadsheets.batchUpdate(
        {
          spreadsheetId: confessionSpreadsheet.spreadsheetId!,
        },
        {
          includeSpreadsheetInResponse: true,
          requests: [
            {
              deleteDeveloperMetadata: {
                dataFilter: {
                  developerMetadataLookup: {
                    metadataKey: IS_SHEETS_INITED_METADATA_KEY,
                    metadataValue: initType,
                    visibility: "PROJECT",
                    metadataLocation: {
                      spreadsheet: true,
                    },
                  },
                },
              },
            },
          ],
        }
      )
    ).result.updatedSpreadsheet;
  }
  if (!init) return confessionSpreadsheet;
  const result = (
    await gapi.client.sheets.spreadsheets.batchUpdate(
      {
        spreadsheetId: confessionSpreadsheet.spreadsheetId!,
      },
      {
        includeSpreadsheetInResponse: true,
        requests: [
          {
            createDeveloperMetadata: {
              developerMetadata: {
                location: {
                  spreadsheet: true,
                },
                metadataKey: IS_SHEETS_INITED_METADATA_KEY,
                metadataValue: initType,
                visibility: "PROJECT",
              },
            },
          },
        ],
      }
    )
  ).result;
  if (
    !result.replies ||
    !result.replies[0].createDeveloperMetadata?.developerMetadata
  ) {
    console.error(result);
    throw "unexpected";
  }
  return result.updatedSpreadsheet;
}
