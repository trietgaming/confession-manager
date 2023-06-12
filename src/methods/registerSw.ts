import { LOCAL_KEY_PENDING_NOTIFICATIONS } from "app-constants";
import { MessagePayload } from "firebase/messaging";
import { userResourceDatabase } from "local-database";
import { setPendingNotification } from "store/index";

export default async function registerSw() {
  if (!("serviceWorker" in navigator))
    throw "This browser doesn't support notification";

  await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    type: "module",
  });

  navigator.serviceWorker.onmessage = async (event) => {
    if (event.data && event.data.type === "backgroundMessage") {
      const pending = (await userResourceDatabase.getItem(
        LOCAL_KEY_PENDING_NOTIFICATIONS
      )) as null | MessagePayload[];
      setPendingNotification((prev) => [...prev, ...(pending || [])]);
    }
  };
  return await navigator.serviceWorker.ready;
}
