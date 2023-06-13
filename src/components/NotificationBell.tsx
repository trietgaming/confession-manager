import { A } from "@solidjs/router";
import {
  APP_LOGO_URL,
  BELL_ICON_URL,
  GOOGLE_FORMS_FAVICON_URL,
  LOCAL_KEY_CACHED_NOTIFICATIONS,
  LOCAL_KEY_PENDING_NOTIFICATIONS,
} from "app-constants";
import { MessagePayload, NotificationPayload } from "firebase/messaging";
import { userResourceDatabase } from "local-database";
import {
  Component,
  For,
  Show,
  batch,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import {
  confesisonForm,
  isMessagingTokenRegistered,
  pendingNotification,
  setPendingNotification,
} from "store/index";

const Notification: Component<{ payload: MessagePayload }> = (props) => {
  const notification: NotificationPayload =
    props.payload.notification ||
    (props.payload.data?.eventType === "RESPONSES"
      ? {
          title: confesisonForm.info?.documentTitle,
          body: JSON.parse(props.payload.data!.values || "[]")[1],
          icon: GOOGLE_FORMS_FAVICON_URL,
        }
      : {
          title: "Confession Manager",
          body: "Thông báo mới!",
          icon: APP_LOGO_URL,
        });
  const timestamp =
    new Date(props.payload.data?.publishTime as string).toLocaleString("vi") ||
    null;

  return (
    <>
      <div class="flex px-2 py-4 space-x-4 items-center hover:bg-gray-200 rounded-lg">
        <img
          src={notification.icon || APP_LOGO_URL}
          alt="Icon"
          class="w-10 h-10"
        />
        <div class="text-left">
          <h2 class="text-lg font-semibold">{notification.title}</h2>
          <p>{notification.body}</p>
          <p class="text-xs text-gray-800 mt-1">{timestamp}</p>
        </div>
      </div>
    </>
  );
};

const NotificationBell: Component = () => {
  const [isNotificationDropdownShow, setNotificationDropdownShow] =
    createSignal(false);

  const [cachedNotifications, setCachedNotifications] = createSignal<
    MessagePayload[]
  >([]);

  createEffect(() => {
    const currentPendingNotification = pendingNotification();
    setCachedNotifications((prev) => [...currentPendingNotification, ...prev]);
  });

  onMount(async () => {
    const localNotifications =
      ((await userResourceDatabase.getItem(LOCAL_KEY_CACHED_NOTIFICATIONS)) as
        | null
        | MessagePayload[]) || [];
    const backgroundPendingNotifications =
      ((await userResourceDatabase.getItem(LOCAL_KEY_PENDING_NOTIFICATIONS)) as
        | null
        | MessagePayload[]) || [];

    batch(() => {
      setCachedNotifications(localNotifications);
      setPendingNotification((prev) => [
        ...prev,
        ...backgroundPendingNotifications,
      ]);
    });
  });

  const handleBellClick = async () => {
    setNotificationDropdownShow((prev) => !prev);
    userResourceDatabase.removeItem(LOCAL_KEY_PENDING_NOTIFICATIONS);
    userResourceDatabase.setItem(
      LOCAL_KEY_CACHED_NOTIFICATIONS,
      cachedNotifications()
    );

    setPendingNotification([]);
  };
  const handleClearNotifications = () => {
    userResourceDatabase.removeItem(LOCAL_KEY_CACHED_NOTIFICATIONS);
    batch(() => {
      setCachedNotifications([]);
      setPendingNotification([]);
    });
  };

  return (
    <div class="relative">
      <button
        onClick={handleBellClick}
        class="rounded-full hover:cursor-pointer hover:bg-slate-200 p-1 relative inline-flex items-center text-sm font-medium text-center"
      >
        <img src={BELL_ICON_URL} alt="Bell" class="w-7 h-7" />
        <span class="sr-only">Notifications</span>
        <Show when={pendingNotification().length > 0}>
          <div class="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 border-2 border-white rounded-full -top-2 -right-2">
            {pendingNotification().length}
          </div>
        </Show>
      </button>
      <Show when={isNotificationDropdownShow()}>
        <div class="flex space-y-2 max-h-[80vh] text-center flex-col absolute bg-white w-[320px] rounded-md drop-shadow-lg translate-y-2 -translate-x-1/2 p-2">
          <Show when={isMessagingTokenRegistered()}>
            <h2 class="text-xl font-bold">Thông báo</h2>
            <div class="overflow-y-auto">
              <For each={cachedNotifications()}>
                {(payload) => <Notification payload={payload} />}
              </For>
              <Show when={cachedNotifications().length === 0}>
                <p class="py-4">- Trống -</p>
              </Show>
            </div>
            <hr />
            <button
              onClick={handleClearNotifications}
              class="w-full hover:bg-gray-200 py-1 rounded-md text-blue-500 disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:bg-white"
              disabled={!cachedNotifications().length}
            >
              Xóa tất cả
            </button>
          </Show>
          <Show when={!isMessagingTokenRegistered()}>
            <h2 class="text-xl font-bold">Bạn chưa bật thông báo</h2>
            <p>Vui lòng bật thông báo ở Cài đặt</p>
            <A
              href="/settings"
              onClick={handleBellClick}
              class="w-full hover:bg-gray-200 py-1 rounded-md text-blue-500"
            >
              Đến cài đặt
            </A>
            <p class="text-sm p-2">
              Bật thông báo để nhận cập nhật mới về câu trả lời confession cũng
              như cập nhật dữ liệu theo thời gian thực trên ứng dụng.
            </p>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default NotificationBell;
