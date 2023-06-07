import { A } from "@solidjs/router";
import axios from "axios";
import handleLogout from "methods/handleLogout";
import subscribeToNotification from "methods/subscribeToNotification";
import { Component, Show, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";
import {
  confessionSpreadsheet,
  isNotificationSubscribed,
  isServiceWorkerRegistered,
} from "store/index";
import { UserInfo, VerticalNavBarMetadata } from "types";
import AppLogo from "ui-components/AppLogo";
import Button from "ui-components/Button";
import LoadingCircle from "ui-components/LoadingCircle";

const DEFAULT_AVATAR_URL = "images/default-avatar.jpg";
const SETTINGS_ICON_URL = "icons/gear-six-icon.svg";
const BELL_ICON_URL = "icons/bell-icon.svg";
const LAUNCH_ICON_URL = "icons/launch-icon.svg";
const LOGOUT_ICON_URL = "icons/sign-out-icon.svg";

const verticalNavBarMetadatas: VerticalNavBarMetadata[] = [
  {
    title: "Đang chờ",
    path: "/",
    iconUrl: "icons/house-icon.svg",
  },
  {
    title: "Đã duyệt",
    path: "/accepted",
    iconUrl: "icons/check-icon.svg",
  },
  {
    title: "Đã từ chối",
    path: "/declined",
    iconUrl: "icons/cross-icon.svg",
  },
  {
    title: "Đăng bài",
    path: "/posting",
    iconUrl: "icons/paper-plane-tilt-icon.svg",
  },
];

const GOOGLE_SHEET_FAVICON_URL =
  "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x32.png";

const NavBar: Component = () => {
  const [isLoggingOut, setLoggingOut] = createSignal(false);
  const [
    isLoadingNotificationSubscription,
    setLoadingNotificationSubscription,
  ] = createSignal(false);

  const [isAccountDropdownShow, setAccountDropdownShow] = createSignal(false);

  const handleLogoutClick = async () => {
    setLoggingOut(true);
    await handleLogout();
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoggingOut(false);
  };

  const [userData, setUserData] = createStore<UserInfo>({
    photoUrl: DEFAULT_AVATAR_URL,
    displayName: "Loading...",
    email: "loading...@gmail.com",
  });

  onMount(async () => {
    const userInfoResponse = (
      await axios.get(
        `https://people.googleapis.com/v1/people/me?personFields=photos,names,emailAddresses&key=${
          import.meta.env.VITE_GOOGLE_API_KEY
        }`,
        {
          headers: {
            Authorization: `Bearer ${gapi.client.getToken().access_token}`,
          },
        }
      )
    ).data as gapi.client.people.Person;
    // console.log(userInfoResponse);
    setUserData({
      email:
        userInfoResponse.emailAddresses?.find((email) => email.metadata.primary)
          ?.value || "user@gmail.com",
      displayName:
        userInfoResponse.names?.find((name) => name.metadata.primary)
          ?.displayName || "Google User",
      photoUrl:
        userInfoResponse.photos?.find((photo) => photo.metadata.primary)?.url ||
        DEFAULT_AVATAR_URL,
    });
  });

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
      <div class="fixed top-0 flex flex-row w-full bg-white py-1 px-6 space-x-6 z-20 justify-between">
        {/* <Button onClick={handleLogoutClick} disabled={isLoggingOut()}>
          Đăng xuất
        </Button> */}
        {/* 
        <Button
          onClick={handleToggleNotification}
          disabled={
            !isServiceWorkerRegistered() || isLoadingNotificationSubscription()
          }
        >
          {isNotificationSubscribed() ? "Tắt" : "Bật"} thông báo{" "}
          {isLoadingNotificationSubscription() ? <LoadingCircle /> : ""}
        </Button> */}

        {/* LeftLogo */}
        <div class="flex items-center space-x-4">
          <AppLogo />
          <h5 class="font-bold">Confession Manager</h5>
        </div>
        {/* CenterNav */}
        <a
          class="flex items-center align-middle space-x-4 hover:bg-slate-200 rounded px-2 mx-auto"
          href={confessionSpreadsheet.spreadsheetUrl}
          target="blank"
        >
          <img
            src={GOOGLE_SHEET_FAVICON_URL}
            alt="Google Sheet"
            class="w-8 h-8"
          />
          <div class="flex items-center space-x-2 font-md text-sm dark:text-white">
            <p>{confessionSpreadsheet.properties?.title}</p>
            <img src={LAUNCH_ICON_URL} alt="New tab" class="w-5 h-5" />
          </div>
        </a>
        {/* RightNav */}
        <div class="flex space-x-4 items-center">
          <button class="rounded-full hover:cursor-pointer hover:bg-slate-200 p-1">
            <img src={BELL_ICON_URL} alt="Bell" class="w-7 h-7" />
          </button>
          <A
            activeClass="bg-sky-100 hover:bg-sky-100"
            href="/settings"
            class="rounded-full hover:cursor-pointer hover:bg-slate-200 p-1"
          >
            <img src={SETTINGS_ICON_URL} alt="Settings" class="w-7 h-7" />
          </A>
          {/* Account */}
          <div>
            <div>
              <button
                onClick={() => setAccountDropdownShow((prev) => !prev)}
                class="text-left flex space-x-2 w-max hover:bg-slate-200 hover:cursor-pointer m-0 p-1 rounded-md"
              >
                <img
                  class="w-9 h-9 rounded-full cursor-pointer"
                  src={userData.photoUrl}
                  alt="Avatar"
                />
                <div class="font-md text-sm dark:text-white">
                  <div>{userData.displayName}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {userData.email}
                  </div>
                </div>
              </button>
              <Show when={isAccountDropdownShow()}>
                <div class="absolute bg-white w-56 right-0 rounded-md divide-y">
                  <button
                    onClick={handleLogoutClick}
                    disabled={isLoggingOut()}
                    class="group w-full items-center flex justify-between hover:bg-slate-200 py-2 px-4 rounded-sm cursor-pointer disabled:text-gray-300"
                  >
                    <p>Đăng xuất</p>
                    <img
                      src={LOGOUT_ICON_URL}
                      alt="logout"
                      class="w-7 h-7"
                    />
                  </button>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
      <div class="fixed flex flex-col justify-center bottom-0 h-full z-10 px-2 bg-white space-y-0.5">
        {verticalNavBarMetadatas.map((metadata) => (
          <A
            end
            activeClass="bg-sky-100 hover:bg-sky-100"
            href={metadata.path}
            class="rounded-lg p-4 flex space-x-4 hover:bg-slate-200 items-center"
          >
            <img src={metadata.iconUrl} alt={metadata.title} class="w-8 h-8" />
            <h5>{metadata.title}</h5>
          </A>
        ))}
      </div>
    </Portal>
  );
};

export default NavBar;
