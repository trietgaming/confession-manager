import { confessionSpreadsheet } from "store/index";
import refreshSpreadsheet from "./refreshSpreadsheet";

export default async function updateSpreadsheetMetadata(
  metadatas: {
    key: string;
    value: string;
    sheet?: gapi.client.sheets.Sheet;
  }[]
) {
  const batchRequests: gapi.client.sheets.Request[] = [];

  for (const payload of metadatas) {
    const notHasMetadataBefore =
      (payload.sheet
        ? payload.sheet
        : confessionSpreadsheet
      ).developerMetadata?.findIndex(
        (metadata) => metadata.metadataKey === payload.key
      ) === -1;

    const location: gapi.client.sheets.DeveloperMetadataLocation = payload.sheet
      ? {
          sheetId: payload.sheet.properties?.sheetId!,
        }
      : {
          spreadsheet: true,
        };

    batchRequests.push(
      notHasMetadataBefore
        ? {
            createDeveloperMetadata: {
              developerMetadata: {
                location,
                metadataKey: payload.key,
                metadataValue: payload.value,
                visibility: "PROJECT",
              },
            },
          }
        : {
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
    );
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
