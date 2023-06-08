import { APP_SCRIPT_ID } from "app-constants";
import axios from "axios";

export default async function getLinkedFormIdFromSheet(
  spreadsheetId: string | null
): Promise<string | null> {
  if (!gapi || !spreadsheetId) return null;

  try {
    const response = await axios.post(
      `https://script.googleapis.com/v1/scripts/${APP_SCRIPT_ID}:run`,
      {
        function: "getLinkedFormId",
        parameters: [spreadsheetId],
      },
      {
        headers: {
          Authorization: `Bearer ${gapi.client.getToken().access_token}`,
        },
      }
    );
    const result = response.data;
    if (result.done && !result.error) {
      return result.response.result;
    }
    return null;
  } catch (err) {
    // TODO: FIRE SNACKBAR;
    return null;
  }
}
