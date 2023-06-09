import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { initializeApp } from "firebase/app";
import localforage from "localforage";

const app = initializeApp({
  apiKey: "AIzaSyAnPO6_ZDiVdNOOYEZShljjd8cdqKyNlAc",
  authDomain: "confession-manager.firebaseapp.com",
  projectId: "confession-manager",
  storageBucket: "confession-manager.appspot.com",
  messagingSenderId: "1041449841105",
  appId: "1:1041449841105:web:43b9b359bea7eb95afb0f0",
  measurementId: "G-Z8MBF96X25",
});

const IS_DEV = location.hostname === "localhost";

const APP_SERVER_URL = IS_DEV
  ? "https://localhost:3000"
  : "https://server.confession-manager.app";

const APP_URL = IS_DEV
  ? "https://localhost:8080"
  : "https://confession-manager.app";

const FORM_DOCUMENT_TITLE_LOCAL_KEY_PREFIX = "_doctitle";

const messaging = getMessaging(app);
const ICON_URL = APP_URL + "/assets/favicon.svg";
// TODO: handle click event
onBackgroundMessage(messaging, async (payload) => {
  if (payload.notification) return null;
  console.log("BACKGROUND: ", payload);
  let notificationTitle = "Thông báo từ CFS MANAGER";
  let notificationOptions = {
    body: "Truy cập ứng dụng để kiểm tra",
    icon: ICON_URL,
  };
  if (payload.data?.eventType === "RESPONSES") {
    let confessionTitle = await localforage.getItem(
      payload.data.formId + FORM_DOCUMENT_TITLE_LOCAL_KEY_PREFIX
    );

    if (confessionTitle === null) {
      const authResponse = await fetch(APP_SERVER_URL + "/auth", {
        credentials: "include",
      });
      const authData = await authResponse.json();

      const accessToken = authData.access_token;

      if (accessToken) {
        const response = await fetch(
          "https://forms.googleapis.com/v1/forms/" + payload.data.formId,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );
        const responseData = await response.json();
        if (!responseData.error) {
          confessionTitle = responseData.info.documentTitle;
          localforage.setItem(
            payload.data.formId + FORM_DOCUMENT_TITLE_LOCAL_KEY_PREFIX,
            responseData.info.documentTitle
          );
        }
      }
    }

    notificationTitle = confessionTitle || notificationTitle;
    notificationOptions = {
      body: "Có câu trả lời mới đến Confession của bạn",
      icon: ICON_URL,
    };
  }

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
