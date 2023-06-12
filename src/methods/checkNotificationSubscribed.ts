import { LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS } from "app-constants";
import { userResourceDatabase } from "local-database";
import { confessionSpreadsheet } from "store/index";

export default async function checkNotificationSubscribed() {
  const spreadsheetId = confessionSpreadsheet.spreadsheetId;
  const subscribedSpreadsheets = await userResourceDatabase.getItem(
    LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS
  );

  return (subscribedSpreadsheets as string[])?.includes(spreadsheetId || "");
}
