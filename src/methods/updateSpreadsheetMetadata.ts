import { confessionSpreadsheet } from "store/index";
import refreshSpreadsheet from "./refreshSpreadsheet";

export default async function updateSpreadsheetMetadata<T extends boolean>(
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
  await refreshSpreadsheet(updatedSpreadsheet);
}
