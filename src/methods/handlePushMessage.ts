import { APP_LOGO_URL, GOOGLE_FORMS_FAVICON_URL } from "app-constants";
import { MessagePayload } from "firebase/messaging";
import { userResourceDatabase } from "local-database";
import {
  confessionSpreadsheet,
  confessions,
  setPendingNotification,
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
    if (
      payload.data?.spreadsheetId === confessionSpreadsheet.spreadsheetId &&
      row ===
        (confessions.pending[confessions.pending.length - 1]?.row || 0) + 1
    ) {
      confessions.pending.push({
        data: values[1],
        date: values[0],
        row,
      });
    }

    payload.notification = {
      title: payload.data?.spreadsheetTitle,
      body: values[1],
      icon: GOOGLE_FORMS_FAVICON_URL,
    };
  }
  setPendingNotification((prev) => [payload, ...prev]);
}
