import {
  APP_LOGO_URL,
  APP_SERVER_URL,
  ConfessionStoreType,
  GOOGLE_FORMS_FAVICON_URL,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS,
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import Confession from "models/Confession";
import {
  MessagePayload,
  NotificationPayload,
  getMessaging,
  getToken,
} from "firebase/messaging";
import { localData, userResourceDatabase } from "local-database";
import {
  confessionMetadata,
  confessionSpreadsheet,
  confessions,
  setPendingNotification,
  sheetsLastRow,
} from "store/index";
import { PushMessageData } from "types";
import { registerSw } from "./AppServiceWorker";
import axios from "axios";
import AppScriptApi from "./AppScriptApi";

export default class NotificationManager {
  static DEFAULT_NOTIFICATION: NotificationPayload = {
    title: "Confession Manager",
    body: "Cập nhật mới.",
    icon: APP_LOGO_URL,
  };

  static handlePushMessage(payload: MessagePayload) {
    payload.notification =
      payload.notification || NotificationManager.DEFAULT_NOTIFICATION;
    if (payload.data?.eventType === "RESPONSES") {
      const data = payload.data as unknown as PushMessageData;
      const values = JSON.parse(data.values);
      const row = +data.range.match(/([0-9]+$)/gm)![0];
      const newConfession = new Confession(
        values,
        row,
        confessionMetadata.pendingSheet!
      );
      if (
        payload.data?.spreadsheetId === confessionSpreadsheet.spreadsheetId &&
        row ===
          (confessions.pending[ConfessionStoreType.ASCENDING][
            confessions.pending.length - 1
          ]?.row || 0) +
            1
      ) {
        confessions.pending[ConfessionStoreType.ASCENDING].push(newConfession);
      }

      if (
        payload.data?.spreadsheetId === confessionSpreadsheet.spreadsheetId &&
        row ===
          (confessions.pending[ConfessionStoreType.DESCENDING][0]?.row || 0) + 1
      ) {
        confessions.pending[ConfessionStoreType.DESCENDING].unshift(
          newConfession
        );
      }

      if (typeof sheetsLastRow.pendingSheet === "number")
        ++sheetsLastRow.pendingSheet;

      payload.notification = {
        title: payload.data?.spreadsheetTitle,
        body: values[1],
        icon: GOOGLE_FORMS_FAVICON_URL,
      };
    }
    setPendingNotification((prev) => [payload, ...prev]);
  }

  static async getMessagingToken() {
    const serviceWorkerRegistration = await registerSw();

    const messagingToken = await getToken(getMessaging(), {
      vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      serviceWorkerRegistration,
    });
    return messagingToken;
  }

  static async subscribe(_spreadsheetId?: string) {
    const spreadsheetId =
      _spreadsheetId ||
      confessionSpreadsheet.spreadsheetId ||
      (await userResourceDatabase.getItem(
        LOCAL_KEY_CONFESSION_SPREADSHEET_ID
      ))!;
    // console.log("subscribe ", spreadsheetId);

    // Subscribe to trigger
    await AppScriptApi.subscribeToFormResponse(spreadsheetId);

    const notificationToken = await localData.getItem(
      LOCAL_KEY_NOTIFICATION_TOKEN
    );
    if (!notificationToken) {
      console.error("Why no token?");
      throw "unexpected error";
    }

    await axios.put(
      APP_SERVER_URL + "/notification",
      {
        spreadsheetId,
        token: notificationToken,
      },
      {
        headers: {
          Authorization: `Bearer ${gapi.client.getToken().access_token}`,
        },
      }
    );
    await userResourceDatabase.setItem(
      LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS,
      [
        ...(((await userResourceDatabase.getItem(
          LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS
        )) as string[] | null) || []),
        spreadsheetId,
      ]
    );
  }

  static async unsubscribe(_spreadsheetId?: string) {
    const spreadsheetId =
      _spreadsheetId ||
      confessionSpreadsheet.spreadsheetId ||
      (await userResourceDatabase.getItem(
        LOCAL_KEY_CONFESSION_SPREADSHEET_ID
      ))!;

    const notificationToken = await localData.getItem(
      LOCAL_KEY_NOTIFICATION_TOKEN
    );

    // console.log("unsubscribe ", spreadsheetId);
    if (!notificationToken) {
      console.error("Why no token?");
      throw "unexpected error";
    }

    await axios.delete(APP_SERVER_URL + "/notification", {
      headers: {
        Authorization: `Bearer ${gapi.client.getToken().access_token}`,
      },
      data: {
        spreadsheetId,
        token: notificationToken,
      },
    });
    await userResourceDatabase.setItem(
      LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS,
      (
        (await userResourceDatabase.getItem(
          LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS
        )) as string[] | null
      )?.filter(
        (cachedspreadsheetId) => cachedspreadsheetId != spreadsheetId
      ) || []
    );
  }

  static async checkCurrentSpreadsheetSubscribed() {
    const spreadsheetId = confessionSpreadsheet.spreadsheetId;
    const subscribedSpreadsheets = await userResourceDatabase.getItem(
      LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS
    );
  
    return (subscribedSpreadsheets as string[])?.includes(spreadsheetId || "");
  }
}
