import {
  APP_SERVER_URL,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS,
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import axios from "axios";
import { localData, userResourceDatabase } from "local-database";
import { confessionSpreadsheet } from "store/index";
export default async function unsubscribeToNotification(
  _spreadsheetId?: string
) {
  const spreadsheetId =
    _spreadsheetId ||
    confessionSpreadsheet.spreadsheetId ||
    (await userResourceDatabase.getItem(LOCAL_KEY_CONFESSION_SPREADSHEET_ID))!;

  const notificationToken = await localData.getItem(
    LOCAL_KEY_NOTIFICATION_TOKEN
  );

  console.log("unsubscribe ", spreadsheetId);
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
    )?.filter((cachedspreadsheetId) => cachedspreadsheetId != spreadsheetId) ||
      []
  );
}
