import {
  BELL_ICON_URL,
  GOOGLE_FORMS_FAVICON_URL,
  GOOGLE_SHEET_FAVICON_URL,
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import useLoading from "app-hooks/useLoading";
import NotificationManager from "controllers/NotificationManager";
import PickerManager from "controllers/PickerManager";
import { localData } from "local-database";
import SelectSheets from "pages/_Init/SelectSheets";
import { Component, Show, createEffect, createSignal } from "solid-js";
import {
  confesisonForm,
  confessionSpreadsheet,
  isPicking,
  isSheetInited,
  picker,
} from "store/index";
import Button from "ui-components/Button";
import LoadingCircle from "ui-components/LoadingCircle";
import Toggle from "ui-components/Toggle";
import {
  doubleTitleContainerClass,
  middleTitleClass,
  settingContainerClass,
  titleIconClass,
} from ".";

const ConfessionSpreadsheetSetting: Component = () => {
  const [
    wrapLoadingNotificationSubscription,
    isLoadingNotificationSubscription,
  ] = useLoading(false);

  const [isNotificationSubscribed, setNotificationSubscribed] = createSignal<
    boolean | null
  >(null);

  createEffect(async () => {
    setNotificationSubscribed(
      await NotificationManager.checkCurrentSpreadsheetSubscribed()
    );
  });

  const handleToggleNotification = wrapLoadingNotificationSubscription(
    async () => {
      try {
        const currentSubscriptionState = isNotificationSubscribed();
        setNotificationSubscribed(!isNotificationSubscribed());
        await localData.setItem(
          LOCAL_KEY_NOTIFICATION_TOKEN,
          await NotificationManager.getMessagingToken()
        );
        currentSubscriptionState
          ? await NotificationManager.unsubscribe()
          : await NotificationManager.subscribe();
      } catch (err) {
        if (!("serviceWorker" in navigator)) {
          alert(
            "Trình duyệt của bạn không hỗ trợ nhận cập nhật về confession mới!"
          );
        } else if (
          !("showNotification" in ServiceWorkerRegistration.prototype)
        ) {
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
        setNotificationSubscribed(!isNotificationSubscribed());
      }
    }
  );
  return (
    <>
      <div class={settingContainerClass}>
        <div class={doubleTitleContainerClass}>
          <img src={BELL_ICON_URL} alt="Bell" class={titleIconClass} />
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
      <div class={settingContainerClass}>
        <div class="flex flex-col space-y-4">
          <div class="flex items-center space-x-8">
            <div class={doubleTitleContainerClass}>
              <img
                src={GOOGLE_SHEET_FAVICON_URL}
                alt="spreadsheet"
                class={titleIconClass}
              />
              <p>Bảng tính chứa Confession</p>
            </div>
            <a
              href={confessionSpreadsheet.spreadsheetUrl}
              target="_blank"
              class={middleTitleClass}
            >
              {confessionSpreadsheet.properties?.title}
            </a>
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
            <a
              href={confesisonForm.responderUri}
              target="_blank"
              class={middleTitleClass}
            >
              {confesisonForm.info?.documentTitle}
            </a>
          </div>
        </div>
        <Button
          onClick={PickerManager.showPicker}
          disabled={isPicking() || !picker()}
          class="group whitespace-nowrap flex space-x-2 items-center"
        >
          <p>Thay đổi</p>
          <LoadingCircle class="group-disabled:block hidden" />
        </Button>
      </div>
      <Show when={!!confessionSpreadsheet?.spreadsheetId}>
        <hr />
        <div class={settingContainerClass + " -translate-y-6"}>
          <SelectSheets settingPage />
        </div>
      </Show>
    </>
  );
};

export default ConfessionSpreadsheetSetting;
