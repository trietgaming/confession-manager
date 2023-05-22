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

const APP_SERVER_URL =
  location.hostname === "localhost"
    ? "https://localhost:3000"
    : "https://confession-manager-server.trietgaming.repl.co";

const FORM_DOCUMENT_TITLE_LOCAL_KEY_PREFIX = "_doctitle";

const messaging = getMessaging(app);

onBackgroundMessage(messaging, async (payload) => {
  let notificationTitle = "Thông báo từ CFS MANAGER";
  let notificationOptions = {
    body: "Truy cập ứng dụng để kiểm tra",
    icon: "/assets/favicon.ico",
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

      if (!authData.ok) return;

      const accessToken = authData.access_token;

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
      if (responseData.error) return;
      confessionTitle = responseData.info.documentTitle;
      localforage.setItem(
        payload.data.formId + FORM_DOCUMENT_TITLE_LOCAL_KEY_PREFIX,
        responseData.info.documentTitle
      );
    }

    notificationTitle = confessionTitle;
    notificationOptions = {
      body: "Có câu trả lời mới đến Confession của bạn",
      icon: "/assets/favicon.ico",
    };
  }

  self.registration.showNotification(notificationTitle, notificationOptions);
});
