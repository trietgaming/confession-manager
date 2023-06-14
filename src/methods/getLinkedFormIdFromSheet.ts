import callAppScriptApi from "./callAppScriptApi";

export default async function getLinkedFormIdFromSheet(
  spreadsheetId: string | null
): Promise<string | null> {
  if (!gapi || !spreadsheetId) return null;

  try {
    const response = await callAppScriptApi("getLinkedFormId", [spreadsheetId]);
    const result = response.data;
    if (result.done && !result.error) {
      return result.response!.result;
    }
    return null;
  } catch (err) {
    // TODO: FIRE SNACKBAR;
    return null;
  }
}
