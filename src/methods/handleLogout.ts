import {
  APP_SERVER_URL,
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS,
} from "app-constants";
import axios from "axios";
import { userResourceDatabase } from "local-database";
import { batch } from "solid-js";
import { reconcile } from "solid-js/store";
import {
  hiddenConfessionRows,
  pendingPost,
  postSettingTemplates,
  resetPendingChanges,
  setConfessionForm,
  setConfessionMetadata,
  setConfessionPageMetadata,
  setConfessionSpreadsheet,
  setLoggedIn,
  setPendingNotification,
  setSheetInited,
  setUserData,
  sheetsLastRow,
} from "store/index";
import handleFBLogout from "./handleFbLogout";
import resetConfessions from "./resetConfessions";
import setAccessToken from "./setAccessToken";
import unsubscribeToNotification from "./unsubscribeToNotification";

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

      await batch(async () => {
        await handleFBLogout();
        setUserData({});
        setAccessToken(null);
        setLoggedIn(false);
        setPendingNotification([]);
        setSheetInited(false);
        setConfessionMetadata(reconcile({}));
        setConfessionSpreadsheet(reconcile({}));
        setConfessionForm(reconcile({}));
        setConfessionPageMetadata(reconcile({ replyHashtag: "", hashtag: "" }));
        sheetsLastRow.acceptedSheet = undefined;
        sheetsLastRow.pendingSheet = undefined;
        sheetsLastRow.postedSheet = undefined;
        sheetsLastRow.declinedSheet = undefined;
        hiddenConfessionRows.hidden = {};
        pendingPost.length = 0;
        resetPendingChanges();
        resetConfessions();
        postSettingTemplates.length = 0;
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
