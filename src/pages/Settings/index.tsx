import { Component, Show, createEffect, createSignal } from "solid-js";
import Button from "ui-components/Button";
import handleLogin from "methods/handleLogin";
import MainTitle from "ui-components/MainTitle";
import {
  confesisonForm,
  confessionSpreadsheet,
  isPicking,
  isSheetInited,
  picker,
} from "store/index";
import {
  BELL_ICON_URL,
  GOOGLE_FORMS_FAVICON_URL,
  GOOGLE_SHEET_FAVICON_URL,
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS,
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import handlePick from "methods/handlePick";
import LoadingCircle from "ui-components/LoadingCircle";
import subscribeToNotification from "methods/subscribeToNotification";
import Toggle from "ui-components/Toggle";
import unsubscribeToNotification from "methods/unsubscribeToNotification";
import getMessagingToken from "methods/getMessagingToken";
import localforage from "localforage";
import checkNotificationSubscribed from "methods/checkNotificationSubscribed";

const settingContainerClass = "flex justify-between items-center";
const doubleTitleContainerClass = "flex items-center space-x-4";
const titleIconClass = "w-8 h-8";
const middleTitleClass =
  "overflow-hidden whitespace-nowrap text-ellipsis max-w-[40%]";

const Settings: Component = () => {
  const [
    isLoadingNotificationSubscription,
    setLoadingNotificationSubscription,
  ] = createSignal(false);

  const [isNotificationSubscribed, setNotificationSubscribed] = createSignal<
    boolean | null
  >(null);

  createEffect(async () => {
    setNotificationSubscribed(await checkNotificationSubscribed());
  });

  const handleToggleNotification = async () => {
    setLoadingNotificationSubscription(true);
    try {
      await localforage.setItem(
        LOCAL_KEY_NOTIFICATION_TOKEN,
        await getMessagingToken()
      );
      isNotificationSubscribed()
        ? await unsubscribeToNotification()
        : await subscribeToNotification();
      setNotificationSubscribed(!isNotificationSubscribed());
    } catch (err) {
      if (!("serviceWorker" in navigator)) {
        alert(
          "Trình duyệt của bạn không hỗ trợ nhận cập nhật về confession mới!"
        );
      } else if (!("showNotification" in ServiceWorkerRegistration.prototype)) {
        alert("Trình duyệt này không hỗ trợ tính năng thông báo!");
      } else if (!("PushManager" in window)) {
        alert("Trình duyệt này không hỗ trợ nhận thông báo!");
      } else if (Notification.permission !== "granted") {
        Notification.requestPermission(() => {
          if (Notification.permission === "denied") {
            alert(
              "Bạn đã chặn quyền thông báo, để sử dụng thông báo, vui lòng cấp quyền thông báo cho ứng dụng!"
            );
          }
        });
      } else {
        console.error(err);
      }
      setNotificationSubscribed((prev) => !prev);
    } finally {
      setLoadingNotificationSubscription(false);
    }
  };

  return (
    <div class="flex justify-center w-full">
      <div class="flex flex-col space-y-6 h-full px-8 w-full max-w-3xl bg-white mt-2 drop-shadow-md rounded-lg pb-8">
        <MainTitle>Cài đặt</MainTitle>
        <div class={settingContainerClass}>
          <div class="flex flex-col space-y-4">
            <div class="flex items-center space-x-8">
              <div class={doubleTitleContainerClass}>
                <img
                  src={GOOGLE_SHEET_FAVICON_URL}
                  alt="spreadsheet"
                  class={titleIconClass}
                />
                <p>Trang tính chứa Confession</p>
              </div>
              <p class={middleTitleClass}>
                {confessionSpreadsheet.properties?.title}
              </p>
            </div>
            <div class="flex items-center space-x-8">
              <div class={doubleTitleContainerClass}>
                <img
                  src={GOOGLE_FORMS_FAVICON_URL}
                  alt="forms"
                  class={titleIconClass}
                />
                <p>Biểu mẫu nhận Confession</p>
              </div>
              <p class={middleTitleClass}>
                {confesisonForm.info?.documentTitle}
              </p>
            </div>
          </div>
          <Button
            onClick={handlePick}
            disabled={isPicking() || !picker()}
            class="group whitespace-nowrap flex space-x-2 items-center"
          >
            <p>Thay đổi</p>
            <LoadingCircle class="group-disabled:block hidden" />
          </Button>
        </div>
        <hr />
        <div class={settingContainerClass}>
          <div class={doubleTitleContainerClass}>
            <img src={BELL_ICON_URL} alt="FB" class={titleIconClass} />
            <p>Thông báo về confession mới</p>
          </div>
          <Toggle
            handleToggle={handleToggleNotification}
            disabled={
              !isSheetInited() ||
              isLoadingNotificationSubscription() ||
              isNotificationSubscribed() === null
            }
            checked={!!isNotificationSubscribed()}
          />
        </div>
        <hr />
        <div class={settingContainerClass}>
          <div class={doubleTitleContainerClass}>
            <img
              src="https://upload.wikimedia.org/wikipedia/en/0/04/Facebook_f_logo_%282021%29.svg"
              alt="FB"
              class={titleIconClass}
            />
            <p>Tài khoản Facebook</p>
          </div>
          <Button>Liên kết</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
