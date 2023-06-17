import {
  APP_LOGO_URL,
  ConfessionStoreType,
  GOOGLE_FORMS_FAVICON_URL,
} from "app-constants";
import Confession from "classes/Confesison";
import { MessagePayload } from "firebase/messaging";
import { userResourceDatabase } from "local-database";
import {
  confessionMetadata,
  confessionSpreadsheet,
  confessions,
  setPendingNotification,
  sheetsLastRow,
} from "store/index";
import { PushMessageData } from "types";

export default function handlePushMessage(payload: MessagePayload) {
  payload.notification = payload.notification || {
    title: "Confession Manager",
    body: "Cập nhật mới.",
    icon: APP_LOGO_URL,
  };
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
