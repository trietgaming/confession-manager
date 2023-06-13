import {
  Component,
  Match,
  Switch,
  batch,
  createEffect,
  onMount,
} from "solid-js";
import {
  loggedIn,
  setGapiLoaded,
  isGapiLoaded,
  setConfessionSpreadsheet,
  setPicker,
  setConfessionForm,
  setPicking,
  confesisonForm,
  picker,
  confessions,
  setPendingNotification,
  setMessagingTokenRegistered,
  confessionSpreadsheet,
  confessionMetadata,
  isSheetInited,
  // setPushEnabled,
} from "./store";
import { Routes, Route, Outlet } from "@solidjs/router";
import Login from "./pages/Login";
import ChangesPanel from "components/ChangesPanel";
// import LoadingCircle from "ui-components/LoadingCircle";
import { initializeApp } from "firebase/app";
import {
  MessagePayload,
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";
import {
  APP_SERVER_URL,
  DISCOVERY_DOCS,
  LOCAL_KEY_CACHED_NOTIFICATIONS,
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
  LOCAL_KEY_NOTIFICATION_TOKEN,
  LOCAL_KEY_PENDING_NOTIFICATIONS,
} from "app-constants";
import axios from "axios";
import CenteredLoadingCircle from "ui-components/CenteredLoadingCircle";
import PopupCallback from "pages/PopupCallback";
import createGoogleApi from "app-hooks/createGoogleApi";
import setAccessToken from "methods/setAccessToken";
import NavBar from "components/NavBar";
import { localData, userResourceDatabase } from "local-database";
import Settings from "pages/Settings";
import getMessagingToken from "methods/getMessagingToken";
import buildPicker from "methods/buildPicker";
import fetchAndInitSpreadsheet from "methods/fetchAndInitSpreadsheet";
import { PushMessageData } from "types";
import handlePushMessage from "methods/handlePushMessage";
import SelectSpreadsheet from "pages/Dashboard/init/SelectSpreadsheet";
import SelectSheets from "pages/Dashboard/init/SelectSheets";
import InitSheets from "pages/Dashboard/init/InitSheets";
import View from "pages/_ConfessionView";

const NavBarWrapper: Component = () => {
  return (
    <div class="md:translate-y-14">
      <Outlet />
    </div>
  );
};

const AuthenticatedRoute: Component = () => {
  onMount(async () => {
    /// TODO: FIRE SNACKBAR
    await fetchAndInitSpreadsheet({
      spreadsheetId: await userResourceDatabase.getItem(
        LOCAL_KEY_CONFESSION_SPREADSHEET_ID
      ),
      formId: await userResourceDatabase.getItem(LOCAL_KEY_CONFESSION_FORM_ID),
    });

    gapi.load("picker", async () => {
      setPicker(buildPicker());
    });
  });
  return (
    <>
      <Route path={"/*"} element={<NavBarWrapper />}>
        <Switch>
          <Match when={!confessionSpreadsheet.spreadsheetId}>
            <Route path={"/*"} element={<SelectSpreadsheet />} />
          </Match>
          <Match
            when={
              !confessionMetadata.pendingSheet ||
              !confessionMetadata.acceptedSheet ||
              !confessionMetadata.declinedSheet ||
              !confessionMetadata.postedSheet
            }
          >
            <Route path={"/*"} element={<SelectSheets />} />
          </Match>
          <Match when={!isSheetInited()}>
            <Route path={"/*"} element={<InitSheets />} />
          </Match>
          <Match
            when={
              confessionSpreadsheet.spreadsheetId &&
              confessionMetadata.pendingSheet &&
              confessionMetadata.acceptedSheet &&
              confessionMetadata.declinedSheet &&
              confessionMetadata.postedSheet
            }
          >
            <Route path={"/"} element={<View key="pending" />} />
            <Route path={"/accepted"} element={<View key="accepted" />} />
            <Route path={"/declined"} element={<View key="declined" />} />
          </Match>
        </Switch>
        <Route path={"/settings"} element={<Settings />} />
      </Route>
      <NavBar />
      <ChangesPanel />
    </>
  );
};

const App: Component = () => {
  let existed_access_token: string | null = null;
  const handleGapiLoaded = () => {
    if (isGapiLoaded()) return;
    gapi.load("client", async () => {
      await gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
      });

      setGapiLoaded(true);
      if (existed_access_token !== null) {
        setAccessToken(existed_access_token);
        existed_access_token = null;
      }
    });
  };

  createGoogleApi(handleGapiLoaded);
  onMount(() => {
    const refreshAccessToken: () => any = async () => {
      try {
        const response = await axios.get(APP_SERVER_URL + "/auth", {
          withCredentials: true,
        });

        /// TODO: check type of this

        const accessToken = response.data.access_token;

        if (response.data.ok) {
          if (isGapiLoaded()) {
            batch(() => {
              setAccessToken(accessToken);
              setPicker(buildPicker());
            });
          } else existed_access_token = accessToken;
        }
        return setTimeout(
          refreshAccessToken,
          // Refresh 30 second earlier
          (response.data.expires_in - 30) * 1000
        );
      } catch (err) {
        return console.error(err);
      }
    };

    refreshAccessToken();
  });

  onMount(async () => {
    const app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    });

    const localNotificationKey = await localData.getItem(
      LOCAL_KEY_NOTIFICATION_TOKEN
    );
    setMessagingTokenRegistered(!!localNotificationKey);
    const subscribedSpreadsheets: string[] | null =
      await userResourceDatabase.getItem(LOCAL_KEY_CONFESSION_SPREADSHEET_ID);
    if (
      !localNotificationKey &&
      (!subscribedSpreadsheets || subscribedSpreadsheets.length === 0)
    )
      return;

    const messaging = getMessaging(app);

    // TODO: Handle update and focus new confession when notification is pushed
    onMessage(messaging, async (payload) => {
      if (payload.data && !payload.data?.publishTime)
        payload.data.publishTime = new Date().toISOString();
      handlePushMessage(payload);
      const backgroundPendings = await userResourceDatabase.getItem(
        LOCAL_KEY_PENDING_NOTIFICATIONS
      );
      await userResourceDatabase.setItem(LOCAL_KEY_PENDING_NOTIFICATIONS, [
        payload,
        ...((backgroundPendings as null | MessagePayload[]) || []),
      ]);
      console.log("MESSAGE: ", payload);
    });

    // If the token is different from local token, this will make a request to firebase api
    // and the service worker will catch the request to handle it
    await getMessagingToken();
  });

  return (
    <Routes>
      <Route path={"/callback"} element={<PopupCallback />} />
      <Route path={"/about"} element={<div>hello</div>} />
      <Switch fallback={<CenteredLoadingCircle />}>
        <Match when={isGapiLoaded()}>
          <Switch>
            <Match when={!loggedIn()}>
              <Route path={"/*"} element={<Login />} />
            </Match>
            <Match when={loggedIn()}>
              <AuthenticatedRoute />
            </Match>
          </Switch>
        </Match>
      </Switch>
    </Routes>
  );
};

export default App;
