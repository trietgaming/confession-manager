import { userResourceDatabase } from "local-database";
import getLinkedFormIdFromSheet from "./getLinkedFormIdFromSheet";
import axios from "axios";
import { batch } from "solid-js";
import { setConfessionForm, setConfessionSpreadsheet } from "store/index";
import initConfessionSpreadsheetMetadata from "./initConfessionSpreadsheetMetadata";
import {
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
} from "app-constants";

const getForm = async (formId: string) =>
  formId
    ? ((await userResourceDatabase.getItem(
        formId
      )) as gapi.client.forms.Form) ||
      (
        await axios.get(
          `https://forms.googleapis.com/v1/forms/${formId}?fields=formId,linkedSheetId,info/documentTitle,responderUri`,
          {
            headers: {
              Authorization: `Bearer ${gapi.client.getToken().access_token}`,
            },
          }
        )
      ).data
    : {};

const getSpreadsheet = async (spreadsheetId: string) =>
  spreadsheetId
    ? ((await userResourceDatabase.getItem(
        spreadsheetId
      )) as gapi.client.sheets.Spreadsheet) ||
      (
        await gapi.client.sheets.spreadsheets.get({
          spreadsheetId,
        })
      ).result
    : {};

const fetchAndInitSpreadsheet = async ({
  spreadsheetId,
  formId,
}: {
  spreadsheetId?: string | null;
  formId?: string | null;
}) => {
  if (!spreadsheetId && !formId) return;

  const form = await getForm(
    formId || (await getLinkedFormIdFromSheet(spreadsheetId!))!
  );
  // TODO: FIRESNACKBAR HERE
  if (!form.linkedSheetId) return alert("Trang tính này chưa liên kết với biểu mẫu nào!");
  const spreadsheet = await getSpreadsheet(
    spreadsheetId || form.linkedSheetId!
  );

  batch(() => {
    setConfessionSpreadsheet(spreadsheet);
    initConfessionSpreadsheetMetadata();
    setConfessionForm(form);
  });

  formId = form.formId;
  spreadsheetId = spreadsheet.spreadsheetId;

  await userResourceDatabase.setItem(
    LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
    spreadsheetId
  );
  await userResourceDatabase.setItem(LOCAL_KEY_CONFESSION_FORM_ID, formId);

  await userResourceDatabase.setItem(form.formId!, form);
  await userResourceDatabase.setItem(spreadsheet.spreadsheetId!, spreadsheet);
};

export default fetchAndInitSpreadsheet;
