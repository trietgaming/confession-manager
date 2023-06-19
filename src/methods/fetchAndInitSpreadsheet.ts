import { userResourceDatabase } from "local-database";
import getLinkedFormIdFromSheet from "./getLinkedFormIdFromSheet";
import axios from "axios";
import { batch } from "solid-js";
import {
  confesisonForm,
  confessionSpreadsheet,
  confessions,
  pendingChanges,
  resetPendingChanges,
  setConfessionForm,
  setConfessionSpreadsheet,
  setLinkResponsesShow,
} from "store/index";
import initConfessionSpreadsheetMetadata from "./initConfessionSpreadsheetMetadata";
import {
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
  PENDING_CHANGES_CONFESSION_ARRAY_KEYS,
} from "app-constants";
import { reconcile } from "solid-js/store";
import resetConfessions from "./resetConfessions";
import initCurrentPage from "./initCurrentPage";

const updateStates = (
  spreadsheet: gapi.client.sheets.Spreadsheet,
  form: gapi.client.forms.Form
) =>
  batch(() => {
    resetPendingChanges();
    if (confessionSpreadsheet?.spreadsheetId !== spreadsheet.spreadsheetId) {
      resetConfessions();
    }
    setConfessionSpreadsheet(spreadsheet);
    initConfessionSpreadsheetMetadata(spreadsheet);
    setConfessionForm(form);
  });

const updateCached = async (
  spreadsheet: gapi.client.sheets.Spreadsheet,
  form: gapi.client.forms.Form
) => {
  await userResourceDatabase.setItem(
    LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
    spreadsheet.spreadsheetId
  );
  await userResourceDatabase.setItem(LOCAL_KEY_CONFESSION_FORM_ID, form.formId);

  await userResourceDatabase.setItem(form.formId!, form);
  await userResourceDatabase.setItem(spreadsheet.spreadsheetId!, spreadsheet);
};

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

const getLocalSpreadsheet = async (spreadsheetId: string) =>
  spreadsheetId
    ? ((await userResourceDatabase.getItem(
        spreadsheetId
      )) as gapi.client.sheets.Spreadsheet)
    : {};

const fetchAndInitSpreadsheet = async ({
  spreadsheetId,
  formId,
  updatedSpreadsheet,
}: {
  spreadsheetId?: string | null;
  formId?: string | null;
  updatedSpreadsheet?: gapi.client.sheets.Spreadsheet;
}) => {
  if (!spreadsheetId && !formId && !updatedSpreadsheet) return;
  const form = updatedSpreadsheet
    ? ((await userResourceDatabase.getItem(
        confesisonForm.formId!
      )) as gapi.client.forms.Form)
    : await getForm(
        formId || (await getLinkedFormIdFromSheet(spreadsheetId!))!
      );
  // TODO: FIRESNACKBAR HERE
  if (!form.formId) return setLinkResponsesShow({ spreadsheetId });
  if (!form.linkedSheetId) return setLinkResponsesShow({ formId: form.formId });

  let spreadsheet =
    updatedSpreadsheet ||
    (await getLocalSpreadsheet(spreadsheetId || form.linkedSheetId!));
  // Update changes from user
  if (!updatedSpreadsheet && spreadsheet) {
    gapi.client.sheets.spreadsheets
      .get({
        spreadsheetId: spreadsheetId || form.linkedSheetId!,
      })
      .then((response) => {
        fetchAndInitSpreadsheet({ updatedSpreadsheet: response.result });
      });
  }
  if (!spreadsheet)
    spreadsheet = (
      await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId || form.linkedSheetId!,
      })
    ).result;

  updateStates(spreadsheet, form);
  initCurrentPage();
  updateCached(spreadsheet, form);
};

export default fetchAndInitSpreadsheet;
