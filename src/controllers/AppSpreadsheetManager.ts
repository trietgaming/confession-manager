import { IS_SHEETS_INITED_METADATA_KEY, SHEETS_INITED_TYPES } from "app-constants";
import fetchAndInitSpreadsheet from "methods/fetchAndInitSpreadsheet";
import { confesisonForm, confessionMetadata, confessionSpreadsheet } from "store/index";

export default class AppSpreadsheetManager {
  static async refresh(
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

  static checkSheetInited() {
    if (!confessionSpreadsheet || !confessionSpreadsheet.developerMetadata)
      return false;
    const metadata = confessionSpreadsheet!.developerMetadata!.find(
      (metadata) => metadata.metadataKey === IS_SHEETS_INITED_METADATA_KEY
    );
    return (
      metadata &&
      ((metadata.metadataValue === SHEETS_INITED_TYPES.FRESH &&
        !!confessionMetadata.archivedSheet) ||
        metadata.metadataValue === SHEETS_INITED_TYPES.FILTERED)
    ) || false;
  };

  static async updateMetadata<T extends boolean>(
    metadatas: {
      key: string;
      value: string;
      sheet?: gapi.client.sheets.Sheet;
    }[],
    returnRequest?: T
  ): Promise<(T extends true ? gapi.client.sheets.Request[] : any) | undefined> {
    const batchRequests: gapi.client.sheets.Request[] = [];
  
    for (const payload of metadatas) {
      const hasMetadataBefore =
        (payload.sheet || confessionSpreadsheet).developerMetadata &&
        (payload.sheet || confessionSpreadsheet).developerMetadata?.findIndex(
          (metadata) => metadata.metadataKey === payload.key
        ) !== -1;
  
      // console.log(payload.sheet);
  
      const location: gapi.client.sheets.DeveloperMetadataLocation = payload.sheet
        ? {
            sheetId: payload.sheet.properties?.sheetId!,
          }
        : {
            spreadsheet: true,
          };
  
      batchRequests.push(
        hasMetadataBefore
          ? {
              updateDeveloperMetadata: {
                fields: "metadataValue",
                dataFilters: [
                  {
                    developerMetadataLookup: {
                      locationType: payload.sheet ? "SHEET" : "SPREADSHEET",
                      metadataLocation: location,
                      metadataKey: payload.key,
                      visibility: "PROJECT",
                    },
                  },
                ],
                developerMetadata: {
                  metadataValue: payload.value,
                },
              },
            }
          : {
              createDeveloperMetadata: {
                developerMetadata: {
                  location,
                  metadataKey: payload.key,
                  metadataValue: payload.value,
                  visibility: "PROJECT",
                },
              },
            }
      );
    }
  
    if (returnRequest === true) {
      return batchRequests;
    }
  
    const updatedSpreadsheet = (
      await gapi.client.sheets.spreadsheets.batchUpdate(
        {
          spreadsheetId: confessionSpreadsheet.spreadsheetId!,
        },
        {
          includeSpreadsheetInResponse: true,
          requests: batchRequests,
        }
      )
    ).result.updatedSpreadsheet!;
    await AppSpreadsheetManager.refresh(updatedSpreadsheet);
  }

  static async setConfessionInited(
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
}
