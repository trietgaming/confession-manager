import {
  APP_SERVER_URL,
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS,
} from "app-constants";
import axios from "axios";
import setAccessToken from "./setAccessToken";
import {
  confessions,
  resetPendingChanges,
  setConfessionForm,
  setConfessionMetadata,
  setConfessionSpreadsheet,
  setLoggedIn,
  setPendingNotification,
  setSheetInited,
} from "store/index";
import { reconcile } from "solid-js/store";
import { batch } from "solid-js";
import { userResourceDatabase } from "local-database";
import unsubscribeToNotification from "./unsubscribeToNotification";
import resetConfessions from "./resetConfessions";

export default async function handleLogout() {
  //TODO: RESET all state of prev user
  try {
    const response = await axios.post(
      APP_SERVER_URL + "/auth/logout",
      undefined,
      {
        withCredentials: true,
      }
    );
    if (response.data.ok) {
      const localSubscribedSpreadsheets: string[] | null =
        await userResourceDatabase.getItem(
          LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS
        );
      if (localSubscribedSpreadsheets) {
        await Promise.all(
          localSubscribedSpreadsheets.map((spreadsheetId) =>
            unsubscribeToNotification(spreadsheetId)
          )
        );
      }
      batch(() => {
        setAccessToken(null);
        setLoggedIn(false);
        setPendingNotification([]);
        setSheetInited(false);
        setConfessionMetadata(reconcile({}));
        setConfessionSpreadsheet(reconcile({}));
        setConfessionForm(reconcile({}));
        resetPendingChanges();
        resetConfessions();
      });
      await userResourceDatabase.clear();
      // await localforage.removeItem(confesisonForm.formId + "_doctitle");
    } else {
      console.error(response.data);
    }
  } catch (err) {
    console.error(err);
  }
}
