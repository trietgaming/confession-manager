import {
  APP_SERVER_URL,
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS,
} from "app-constants";
import axios from "axios";
import ConfessionsManager from "controllers/ConfessionsManager";
import FacebookAccountManager from "controllers/FacebookAccountManager";
import GoogleAccessTokenManager from "controllers/GoogleAccessTokenManager";
import NotificationManager from "controllers/NotificationManager";
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
            NotificationManager.unsubscribe(spreadsheetId)
          )
        );
      }

      await batch(async () => {
        await FacebookAccountManager.logout();
        setUserData({});
        GoogleAccessTokenManager.setToken(null);
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
        ConfessionsManager.clearAll();
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
