import {
  APP_SERVER_URL,
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_NOTIFICATION_TOKEN,
  NOTIFICATION_TOPIC,
} from "app-constants";
import axios from "axios";
import { getApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import localforage from "localforage";
export default async function subscribeToNotification() {
  const localFormId = (await localforage.getItem(
    LOCAL_KEY_CONFESSION_FORM_ID
  )) as string | null;
  if (localFormId === null) {
    // TODO: render picker for user to choose and handle it (check if chosen form.linkedsheetId === currentSheetId)
    return alert(
      "Vui lòng chọn một biểu mẫu confession thay vì bảng tính để nhận thông báo!"
    );
  }
  // Check if a watch is existed
  const watchList = await gapi.client.forms.forms.watches.list({
    formId: localFormId,
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
      formId: localFormId,
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
      form_id: localFormId,
      token: notificationToken,
    },
    {
      headers: {
        Authorization: `Bearer ${gapi.client.getToken().access_token}`,
      },
    }
  );
  console.log("subscribe OK!");
}
