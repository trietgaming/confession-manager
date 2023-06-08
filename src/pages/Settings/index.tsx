import { Component, Show, createSignal } from "solid-js";
import Button from "ui-components/Button";
import handleLogin from "methods/handleLogin";
import MainTitle from "ui-components/MainTitle";
import {
  confesisonForm,
  confessionSpreadsheet,
  isNotificationSubscribed,
  isPicking,
  isServiceWorkerRegistered,
  picker,
} from "store/index";
import {
  BELL_ICON_URL,
  GOOGLE_FORMS_FAVICON_URL,
  GOOGLE_SHEET_FAVICON_URL,
} from "app-constants";
import handlePick from "methods/handlePick";
import LoadingCircle from "ui-components/LoadingCircle";
import subscribeToNotification from "methods/subscribeToNotification";

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

  const handleToggleNotification = async () => {
    if (!("serviceWorker" in navigator)) {
      return alert(
        "Trình duyệt của bạn không hỗ trợ nhận cập nhật về confession mới!"
      );
    }

    if (!("showNotification" in ServiceWorkerRegistration.prototype)) {
      return alert("Trình duyệt này không hỗ trợ tính năng thông báo!");
    }

    if (!("PushManager" in window)) {
      return alert("Trình duyệt này không hỗ trợ nhận thông báo!");
    }

    if (Notification.permission !== "granted") {
      Notification.requestPermission(() => {
        if (Notification.permission === "denied") {
          return alert(
            "Bạn đã chặn quyền thông báo, để sử dụng thông báo, vui lòng cấp quyền thông báo cho ứng dụng!"
          );
        }
      });
    }

    setLoadingNotificationSubscription(true);
    if (!isNotificationSubscribed()) {
      await subscribeToNotification();
    }
    setLoadingNotificationSubscription(false);
  };

  return (
    <div class="flex justify-center w-full">
      <div class="flex flex-col space-y-6 h-full px-8 w-full max-w-3xl bg-white mt-2 drop-shadow-md rounded-lg pb-8">
        <MainTitle>Cài đặt</MainTitle>
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
        <div class={settingContainerClass}>
          <div class={doubleTitleContainerClass}>
            <img src={BELL_ICON_URL} alt="FB" class={titleIconClass} />
            <p>Thông báo về confession mới</p>
          </div>

          <Button
            onClick={handleToggleNotification}
            disabled={
              !isServiceWorkerRegistered() ||
              isLoadingNotificationSubscription()
            }
            class="flex items-center space-x-2"
          >
            <p>{isNotificationSubscribed() ? "Tắt" : "Bật"}</p>
            {isLoadingNotificationSubscription() ? <LoadingCircle /> : ""}
          </Button>
        </div>
        <hr />
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
      </div>
    </div>
  );
};

export default Settings;
