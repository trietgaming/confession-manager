import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { initializeApp } from "firebase/app";
import { localData, userResourceDatabase } from "./src/constants/database";
import {
  APP_SERVER_URL,
  BASE_URL,
  APP_SCRIPT_RUN_URL,
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS,
  LOCAL_KEY_NOTIFICATION_TOKEN,
  LOCAL_KEY_PENDING_NOTIFICATIONS,
  GOOGLE_FORMS_FAVICON_URL,
} from "app-constants";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

const messaging = getMessaging(app);

const ICON_URL = BASE_URL + "/assets/favicon.svg";
// TODO: handle click event

const getAccessToken = async () => {
  const authResponse = await fetch(APP_SERVER_URL + "/auth", {
    credentials: "include",
  });
  const authData = await authResponse.json();
  return authData.access_token;
};

self.addEventListener("activate", () => {
  clients.claim();
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  if (
    e.request.url !==
    "https://fcmregistrations.googleapis.com/v1/projects/confession-manager/registrations"
  )
    return;

  let accessToken = null;

  const fetchNotificationToken = async () => {
    const notificationTokenResponse = await fetch(e.request);
    const oldNotificationToken = await localData.getItem(
      LOCAL_KEY_NOTIFICATION_TOKEN
    );
    if (oldNotificationToken === null) return notificationTokenResponse;

    const notificationResult = await notificationTokenResponse.clone().json();

    const notificationToken = notificationResult.token;
    await localData.setItem(LOCAL_KEY_NOTIFICATION_TOKEN, notificationToken);

    const localSubscribedSpreadsheets = await userResourceDatabase.getItem(
      LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS
    );
    if (localSubscribedSpreadsheets && localSubscribedSpreadsheets.length) {
      accessToken = await getAccessToken();
      await Promise.all(
        localSubscribedSpreadsheets.map((spreadsheetId) =>
          unsubscribeToNotification(spreadsheetId, oldNotificationToken)
        )
      );
      await Promise.all(
        localSubscribedSpreadsheets.map((spreadsheetId) =>
          subscribeToNotification(spreadsheetId, notificationToken)
        )
      );
    }

    return notificationTokenResponse;
  };

  const subscribeToNotification = async (spreadsheetId, notificationToken) => {
    console.log("subscribe ", spreadsheetId);
    // Subscribe to trigger event
    await fetch(APP_SCRIPT_RUN_URL, {
      method: "post",
      headers: {
        Authorization: `Bearer ${gapi.client.getToken().access_token}`,
      },
      body: JSON.stringify({
        function: "subscribeToFormResponse",
        parameters: [spreadsheetId],
      }),
    });

    // Subscribe to server push
    await fetch(APP_SERVER_URL + "/notification", {
      method: "put",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spreadsheetId,
        token: notificationToken,
      }),
    });
  };

  const unsubscribeToNotification = async (
    spreadsheetId,
    notificationToken
  ) => {
    console.log("unsubscribe ", spreadsheetId);
    await fetch(APP_SERVER_URL + "/notification", {
      method: "delete",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spreadsheetId,
        token: notificationToken,
      }),
    });
  };
  e.waitUntil(e.respondWith(fetchNotificationToken()));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(BASE_URL) && "focus" in client)
            return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      })
  );
});

onBackgroundMessage(messaging, async (payload) => {
  console.log("BACKGROUND: ", payload);
  let notificationTitle = "Confession Manager";
  let notificationOptions = {
    body: "Cập nhật mới.",
    icon: ICON_URL,
  };
  if (payload.data?.eventType === "RESPONSES") {
    notificationTitle = payload.data.spreadsheetTitle;
    notificationOptions = {
      body:
        JSON.parse(payload.data?.values)[1] ||
        "Có phản hồi mới đến confession của bạn",
      icon: ICON_URL,
    };
  }
  if (!payload.data.publishTime)
    payload.data.publishTime = new Date().toISOString();

  const pendings = await userResourceDatabase.getItem(
    LOCAL_KEY_PENDING_NOTIFICATIONS
  );
  await userResourceDatabase.setItem(LOCAL_KEY_PENDING_NOTIFICATIONS, [
    payload,
    ...(pendings || []),
  ]);

  let firebaseNotification = false;

  if (payload.notification) firebaseNotification = true;
  else
    payload.notification = {
      title: notificationTitle,
      body: notificationOptions.body,
      icon: GOOGLE_FORMS_FAVICON_URL,
    };

  await self.clients
    .matchAll({
      includeUncontrolled: true,
      type: "window",
    })
    .then((clients) => {
      if (clients && clients.length) {
        clients[0].postMessage({
          type: "backgroundMessage",
          payload,
        });
      }
    });

  if (firebaseNotification) return null;
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
