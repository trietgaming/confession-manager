import { LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS } from "./../constants/index";
import {
  APP_SERVER_URL,
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_NOTIFICATION_TOKEN,
  NOTIFICATION_TOPIC,
} from "app-constants";
import axios from "axios";
import localforage from "localforage";
import { confesisonForm } from "store/index";
export default async function subscribeToNotification() {
  const formId =
    confesisonForm.formId ||
    (await localforage.getItem(LOCAL_KEY_CONFESSION_FORM_ID))!;
  // Check if a watch is existed
  const watchList = await gapi.client.forms.forms.watches.list({
    formId,
  });

  if (
    !watchList.result.watches?.some((watch) => {
      return (
        watch.target?.topic?.topicName === NOTIFICATION_TOPIC &&
        watch.eventType === "RESPONSES"
      );
    })
  ) {
    await gapi.client.forms.forms.watches.create({
      formId,
      resource: {
        watch: {
          eventType: "RESPONSES",
          target: {
            topic: {
              topicName: NOTIFICATION_TOPIC,
            },
          },
        },
      },
    });
  }

  const notificationToken = await localforage.getItem(
    LOCAL_KEY_NOTIFICATION_TOKEN
  );
  if (!notificationToken) {
    console.error("Why no token?");
    throw "unexpected error";
  }

  await axios.put(
    APP_SERVER_URL + "/notification",
    {
      form_id: formId,
      token: notificationToken,
    },
    {
      headers: {
        Authorization: `Bearer ${gapi.client.getToken().access_token}`,
      },
    }
  );
  await localforage.setItem(LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS, [
    ...(((await localforage.getItem(
      LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS
    )) as string[] | null) || []),
    formId,
  ]);
}
