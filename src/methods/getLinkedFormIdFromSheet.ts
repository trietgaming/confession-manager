import AppScriptApi from "controllers/AppScriptApi";

/**
 * @deprecated
 */
export default async function getLinkedFormIdFromSheet(
  spreadsheetId: string | null
): Promise<string | null> {
  if (!gapi || !spreadsheetId) return null;

  try {
    return await AppScriptApi.getLinkedFormId(spreadsheetId);
  } catch (err) {
    // TODO: FIRE SNACKBAR;
    return null;
  }
}
