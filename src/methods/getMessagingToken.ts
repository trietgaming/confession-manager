import { getMessaging, getToken } from "firebase/messaging";
import registerSw from "./registerSw";

export default async function getMessagingToken() {
  const serviceWorkerRegistration = await registerSw();

  const messagingToken = await getToken(getMessaging(), {
    vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    serviceWorkerRegistration,
  });
  return messagingToken;
}
