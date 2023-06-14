import {
  APP_SCRIPT_RUN_URL,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS,
} from "app-constants";
import { APP_SERVER_URL, LOCAL_KEY_NOTIFICATION_TOKEN } from "app-constants";
import axios from "axios";
import { localData, userResourceDatabase } from "local-database";
import { confessionSpreadsheet } from "store/index";
import callAppScriptApi from "./callAppScriptApi";

export default async function subscribeToNotification(_spreadsheetId?: string) {
  const spreadsheetId =
    _spreadsheetId ||
    confessionSpreadsheet.spreadsheetId ||
    (await userResourceDatabase.getItem(LOCAL_KEY_CONFESSION_SPREADSHEET_ID))!;
  // console.log("subscribe ", spreadsheetId);

  // Subscribe to trigger
  await callAppScriptApi("subscribeToFormResponse", [spreadsheetId]);

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
