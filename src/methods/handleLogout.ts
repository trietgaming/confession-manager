import {
  APP_SERVER_URL,
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import axios from "axios";
import setAccessToken from "./setAccessToken";
import {
  confesisonForm,
  setConfessionForm,
  setConfessionMetadata,
  setConfessionSpreadsheet,
  setPendingChanges,
} from "store/index";
import { reconcile } from "solid-js/store";
import { batch } from "solid-js";
import localforage from "localforage";

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
      batch(() => {
        setAccessToken(null);
        setConfessionMetadata(reconcile({}));
        setConfessionSpreadsheet(reconcile({}));
        setPendingChanges(reconcile({}));
        setConfessionForm(reconcile({}));
      });
      await localforage.removeItem(LOCAL_KEY_CONFESSION_FORM_ID);
      await localforage.removeItem(LOCAL_KEY_CONFESSION_SPREADSHEET_ID);
      // await localforage.removeItem(confesisonForm.formId + "_doctitle");
    } else {
      console.error(response.data);
    }
  } catch (err) {
    console.error(err);
  }
}
