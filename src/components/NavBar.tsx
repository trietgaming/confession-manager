import { A } from "@solidjs/router";
import {
  BELL_ICON_URL,
  BUG_ICON_URL,
  CHECK_ICON_URL,
  CROSS_ICON_URL,
  DEFAULT_AVATAR_URL,
  GOOGLE_SHEET_FAVICON_URL,
  HEART_ICON_URL,
  HOUSE_ICON_URL,
  LAUNCH_ICON_URL,
  LOGOUT_ICON_URL,
  PAPER_PLANE_ICON_URL,
  SETTINGS_ICON_URL,
} from "app-constants";
import axios from "axios";
import handleLogout from "methods/handleLogout";
import { Component, Show, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";
import { confessionSpreadsheet, isSheetInited } from "store/index";
import { UserInfo, VerticalNavBarMetadata } from "types";
import AppLogo from "ui-components/AppLogo";

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

  return (
    <Portal>
      <div class="fixed top-0 flex flex-row w-full bg-white py-1 px-6 space-x-6 z-[2] justify-between">
        {/* LeftLogo */}
        <A class="flex items-center space-x-4" href="/">
          <AppLogo />
          <h5 class="font-bold">Confession Manager</h5>
        </A>
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
                <div class="font-md text-sm dark:text-white">
                  <div>{userData.displayName}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {userData.email}
                  </div>
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
        <div class="fixed flex flex-col justify-center bottom-0 h-full z-[1] px-2 bg-white space-y-0.5">
          {verticalNavBarMetadatas.map((metadata) => (
            <A
              end
              activeClass="bg-sky-100"
              href={metadata.path}
              class="rounded-lg p-4 flex space-x-4 hover:bg-slate-200 items-center"
            >
              <img
                src={metadata.iconUrl}
                alt={metadata.title}
                class="w-8 h-8"
              />
              <h5>{metadata.title}</h5>
            </A>
          ))}
        </div>
      </Show>
    </Portal>
  );
};

export default NavBar;
