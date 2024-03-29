import NotificationManager from "controllers/NotificationManager";

export async function registerSw() {
  if (!("serviceWorker" in navigator))
    throw "This browser doesn't support notification";

  await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    type: "module",
  });

  navigator.serviceWorker.onmessage = async (event) => {
    if (event.data && event.data.type === "backgroundMessage") {
      const payload = event.data.payload;
      NotificationManager.handlePushMessage(payload);
      console.log("background event");
    }
  };
  return await navigator.serviceWorker.ready;
}
