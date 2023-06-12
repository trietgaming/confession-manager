import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { initializeApp } from "firebase/app";
import { localData, userResourceDatabase } from "./src/constants/database";

const app = initializeApp({
  apiKey: "AIzaSyAnPO6_ZDiVdNOOYEZShljjd8cdqKyNlAc",
  authDomain: "confession-manager.firebaseapp.com",
  projectId: "confession-manager",
  storageBucket: "confession-manager.appspot.com",
  messagingSenderId: "1041449841105",
  appId: "1:1041449841105:web:43b9b359bea7eb95afb0f0",
  measurementId: "G-Z8MBF96X25",
});

const messaging = getMessaging(app);

const IS_DEV = location.hostname === "localhost";

const APP_SERVER_URL = IS_DEV
  ? "https://localhost:3000"
  : "https://server.confession-manager.app";

const APP_URL = IS_DEV
  ? "https://localhost:8080"
  : "https://confession-manager.app";

const ICON_URL = APP_URL + "/assets/favicon.svg";

const APP_SCRIPT_RUN_URL =
  "https://script.googleapis.com/v1/scripts/AKfycbx1z61KgHlJxPtJjUp1LS4N9BK-4BDnySVLj2ESrUCEaSZg6kaE4a4e6nTvizmHkxdC:run";

const LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS =
  "notification_subscribed";
const LOCAL_KEY_NOTIFICATION_TOKEN = "notification_token";
// TODO: handle click event

const getAccessToken = async () => {
  const authResponse = await fetch(APP_SERVER_URL + "/auth", {
    credentials: "include",
  });
  const authData = await authResponse.json();
  return authData.access_token;
};

self.addEventListener("activate", async () => {
  clients.claim();
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

onBackgroundMessage(messaging, async (payload) => {
  if (payload.notification) return null;
  console.log("BACKGROUND: ", payload);
  let notificationTitle = "Confession Manager";
  let notificationOptions = {
    body: "Truy cập ứng dụng để kiểm tra",
    icon: ICON_URL,
  };
  if (payload.data?.eventType === "RESPONSES") {
    let confessionTitle =
      (await userResourceDatabase.getItem(payload.data.spreadsheetId))
        ?.properties?.title || payload.data.spreadsheetId;

    notificationTitle = confessionTitle || notificationTitle;
    notificationOptions = {
      body: JSON.parse(payload.data?.values)[1] || "Có phản hồi mới đến confession của bạn",
      icon: ICON_URL,
    };
  }

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
