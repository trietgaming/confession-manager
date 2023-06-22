import { A } from "@solidjs/router";
import {
  BELL_ICON_URL,
  BUG_ICON_URL,
  CHECK_ICON_URL,
  CROSS_ICON_URL,
  DEFAULT_AVATAR_URL,
  GOOGLE_FORMS_FAVICON_URL,
  GOOGLE_SHEET_FAVICON_URL,
  HEART_ICON_URL,
  HOUSE_ICON_URL,
  LAUNCH_ICON_URL,
  LOGOUT_ICON_URL,
  PAPER_PLANE_ICON_URL,
  RIGHT_ARROW_ICON_URL,
  SETTINGS_ICON_URL,
} from "app-constants";
import axios from "axios";
import handleLogout from "methods/handleLogout";
import { Component, Show, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";
import {
  confesisonForm,
  confessionSpreadsheet,
  isSheetInited,
} from "store/index";
import { UserInfo, VerticalNavBarMetadata } from "types";
import AppLogo from "ui-components/AppLogo";
import NotificationBell from "./NotificationBell";
import checkNotificationSubscribed from "methods/checkNotificationSubscribed";

const verticalNavBarMetadatas: VerticalNavBarMetadata[] = [
  {
    title: "Đang chờ",
    path: "/",
    iconUrl: HOUSE_ICON_URL,
  },
  {
    title: "Đã duyệt",
    path: "/accepted",
    iconUrl: CHECK_ICON_URL,
  },
  {
    title: "Đã từ chối",
    path: "/declined",
    iconUrl: CROSS_ICON_URL,
  },
  {
    title: "Đăng bài",
    path: "/posting",
    iconUrl: PAPER_PLANE_ICON_URL,
  },
];

const AccountDropDownElementClass =
  "w-full items-center flex space-x-4 hover:bg-slate-200 py-3 px-4 rounded-sm cursor-pointer disabled:text-gray-300";

const NavBar: Component = () => {
  const [isLoggingOut, setLoggingOut] = createSignal(false);
  const [isVerticalNavExtended, setVerticalNavExtended] = createSignal(false);

  const [isAccountDropdownShow, setAccountDropdownShow] = createSignal(false);
  const [userData, setUserData] = createStore<UserInfo>({
    photoUrl: DEFAULT_AVATAR_URL,
    displayName: "Loading...",
    email: "loading...@gmail.com",
  });

  const handleLogoutClick = async () => {
    setLoggingOut(true);
    await handleLogout();
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoggingOut(false);
  };
  const handleToggleAccountDropdownShow = () =>
    setAccountDropdownShow((prev) => !prev);

  onMount(async () => {
    const userInfoResponse = (
      await axios.get<{
        email: string,
        email_verified: boolean,
        given_name: string,
        locale: string,
        name: string,
        picture: string,
        sub: string
      }>(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${gapi.client.getToken().access_token}`,
          },
        }
      )
    ).data;
    // console.log(userInfoResponse);
    setUserData({
      email:
        userInfoResponse.email,
      displayName:
        userInfoResponse.name,
      photoUrl:
        userInfoResponse.picture,
    });
  });

  return (
    <Portal>
      <div class="fixed top-0 flex flex-row w-full bg-white py-1 pr-6 pl-2 space-x-6 z-[2] justify-between">
        {/* LeftLogo */}
        <div class="flex items-center space-x-2">
          <Show when={isSheetInited()}>
            <button
              onClick={() => setVerticalNavExtended((prev) => !prev)}
              class="rounded-full hover:bg-gray-200 flex justify-center items-center w-8 h-8"
            >
              <img
                src={RIGHT_ARROW_ICON_URL}
                alt="Menu"
                class={`w-7 h-7 ${isVerticalNavExtended() ? "rotate-180" : ""}`}
              />
            </button>
          </Show>
          <A class="flex items-center space-x-4" href="/">
            <AppLogo />
            <h5 class="font-bold">Confession Manager</h5>
          </A>
        </div>
        {/* RightNav */}
        <div class="flex space-x-4 items-center">
          <NotificationBell />
          <A
            activeClass="bg-sky-100"
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
                <div class="font-md text-sm">
                  <div>{userData.displayName}</div>
                  <div class="text-sm text-gray-500">{userData.email}</div>
                </div>
              </button>
              {/* Dropdown */}
              <Show when={isAccountDropdownShow()}>
                <div class="absolute bg-white w-56 right-0 rounded-md drop-shadow-lg translate-y-2">
                  <A
                    href="ticket"
                    class={AccountDropDownElementClass}
                    onClick={handleToggleAccountDropdownShow}
                  >
                    <img src={BUG_ICON_URL} alt="logout" class="w-7 h-7" />
                    <p>Báo lỗi & Góp ý</p>
                  </A>
                  <A
                    href="donation"
                    class={AccountDropDownElementClass}
                    onClick={handleToggleAccountDropdownShow}
                  >
                    <img src={HEART_ICON_URL} alt="logout" class="w-7 h-7" />
                    <p>Ủng hộ App</p>
                  </A>
                  <hr />
                  <button
                    onClick={handleLogoutClick}
                    disabled={isLoggingOut()}
                    class={AccountDropDownElementClass}
                  >
                    <img src={LOGOUT_ICON_URL} alt="logout" class="w-7 h-7" />
                    <p>Đăng xuất</p>
                  </button>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
      {/* Vertical Nav */}
      <Show when={isSheetInited()}>
        {/* <div class="fixed flex flex-col justify-center bottom-0 h-full z-[1] px-2 bg-white space-y-0.5">
          
        </div> */}
        <div
          class={`fixed top-[56px] flex flex-col left-0 z-[1] h-screen overflow-y-auto transition-transform bg-white ${isVerticalNavExtended() ? "w-max" : "w-[64px]"
            } space-y-4 px-2`}
          tabindex="-1"
          aria-labelledby="drawer-left-label"
        >
          <a
            class="rounded-lg flex space-x-4 hover:bg-slate-200 items-center p-2"
            href={confessionSpreadsheet.spreadsheetUrl}
            target="_blank"
          >
            <img
              src={GOOGLE_SHEET_FAVICON_URL}
              alt="Google Sheet"
              class="w-8 h-8"
            />
            <div class="flex items-center space-x-2 font-md text-sm">
              <p
                hidden={!isVerticalNavExtended()}
                class="max-w-[140px] overflow-hidden whitespace-nowrap text-ellipsis"
              >
                {confessionSpreadsheet.properties?.title}
              </p>
              <img src={LAUNCH_ICON_URL} alt="New tab" class="w-5 h-5" />
            </div>
          </a>
          <a
            class="rounded-lg flex space-x-4 hover:bg-slate-200 items-center p-2"
            href={confesisonForm.responderUri}
            target="_blank"
          >
            <img
              src={GOOGLE_FORMS_FAVICON_URL}
              alt="Google Forms"
              class="w-8 h-8"
            />
            <div class="flex items-center space-x-2 font-md text-sm">
              <p
                hidden={!isVerticalNavExtended()}
                class="max-w-[140px] overflow-hidden whitespace-nowrap text-ellipsis"
              >
                {confesisonForm.info?.documentTitle}
              </p>
              <img src={LAUNCH_ICON_URL} alt="New tab" class="w-5 h-5" />
            </div>
          </a>
          <hr />
          {verticalNavBarMetadatas.map((metadata) => (
            <A
              end
              activeClass="bg-sky-100"
              href={metadata.path}
              class="rounded-lg flex space-x-4 hover:bg-slate-200 items-center p-2"
            >
              <img
                src={metadata.iconUrl}
                alt={metadata.title}
                class="w-8 h-8"
              />
              <h5 hidden={!isVerticalNavExtended()}>{metadata.title}</h5>
            </A>
          ))}
        </div>
      </Show>
    </Portal>
  );
};

export default NavBar;
