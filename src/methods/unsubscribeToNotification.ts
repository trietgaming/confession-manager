import {
  APP_SERVER_URL,
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS,
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import axios from "axios";
import localforage from "localforage";
import { confesisonForm } from "store/index";
export default async function unsubscribeToNotification() {
  const formId =
    confesisonForm.formId ||
    (await localforage.getItem(LOCAL_KEY_CONFESSION_FORM_ID))!;
  const notificationToken = await localforage.getItem(
    LOCAL_KEY_NOTIFICATION_TOKEN
  );
  if (!notificationToken) {
    console.error("Why no token?");
    throw "unexpected error";
  }

  await axios.delete(APP_SERVER_URL + "/notification", {
    headers: {
      Authorization: `Bearer ${gapi.client.getToken().access_token}`,
    },
    data: {
      form_id: formId,
      token: notificationToken,
    },
  });
  await localforage.removeItem(LOCAL_KEY_NOTIFICATION_TOKEN);
  await localforage.setItem(
    LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS,
    (
      (await localforage.getItem(LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS)) as
        | string[]
        | null
    )?.filter((cachedFormId) => cachedFormId != formId) || []
  );
}
