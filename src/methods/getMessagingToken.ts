import { getMessaging, getToken } from "firebase/messaging";

export default async function getMessagingToken() {
  if (!("serviceWorker" in navigator))
    throw "This browser doesn't support notification";

  let serviceWorkerRegistration;

  await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    type: "module",
  });
  serviceWorkerRegistration = await navigator.serviceWorker.ready;
  const messagingToken = await getToken(getMessaging(), {
    vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    serviceWorkerRegistration,
  });
  return messagingToken;
}
