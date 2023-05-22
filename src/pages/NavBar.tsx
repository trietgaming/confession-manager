import handleLogout from "methods/handleLogout";
import subscribeToNotification from "methods/subscribeToNotification";
import { Component, createSignal, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import {
  isNotificationSubscribed,
  isServiceWorkerRegistered,
} from "store/index";
import Button from "ui-components/Button";
import LoadingCircle from "ui-components/LoadingCircle";

const NavBar: Component = () => {
  const [isLoggingOut, setLoggingOut] = createSignal(false);
  const [
    isLoadingNotificationSubscription,
    setLoadingNotificationSubscription,
  ] = createSignal(false);

  const handleLogoutClick = async () => {
    setLoggingOut(true);
    await handleLogout();
    setLoggingOut(false);
  };

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
            "Bạn đã chặn quyên thông báo, để sử dụng thông báo, vui lòng cấp quyền thông báo cho ứng dụng!"
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
    <Portal>
      <div class="fixed top-0">
        <Button onClick={handleLogoutClick} disabled={isLoggingOut()}>
          Đăng xuất
        </Button>
        <Button
          onClick={handleToggleNotification}
          disabled={
            !isServiceWorkerRegistered() || isLoadingNotificationSubscription()
          }
        >
          {isNotificationSubscribed() ? "Tắt" : "Bật"} thông báo{" "}
          {isLoadingNotificationSubscription() ? <LoadingCircle /> : ""}
        </Button>
      </div>
    </Portal>
  );
};

export default NavBar;
