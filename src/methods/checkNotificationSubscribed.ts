import { LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS } from "app-constants";
import localforage from "localforage";
import { confesisonForm } from "store/index";

export default async function checkNotificationSubscribed() {
  const formId = confesisonForm.formId;
  const subscribedForms = await localforage.getItem(
    LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS
  );

  return (subscribedForms as string[])?.includes(formId || "")
}