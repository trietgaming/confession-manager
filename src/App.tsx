import { Route, Routes } from "@solidjs/router";
import ChangesPanel from "components/ChangesPanel";
import { Component, Match, Switch, batch, onMount } from "solid-js";
import {
  confessionMetadata,
  confessionSpreadsheet,
  isGapiLoaded,
  isSheetInited,
  loggedIn,
  setGapiLoaded,
  setMessagingTokenRegistered,
  setPicker,
  setUserData,
} from "./store";
// import LoadingCircle from "ui-components/LoadingCircle";
import {
  APP_SERVER_URL,
  DISCOVERY_DOCS,
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
  LOCAL_KEY_NOTIFICATION_TOKEN,
  LOCAL_KEY_PENDING_NOTIFICATIONS,
} from "app-constants";
import createFacebook from "methods/createFacebook";
import createGoogleApi from "methods/createGoogleApi";
import axios from "axios";
import LinkResponses from "components/LinkResponses";
import NavBar from "components/NavBar";
import { initializeApp } from "firebase/app";
import { MessagePayload, getMessaging, onMessage } from "firebase/messaging";
import { localData, userResourceDatabase } from "local-database";
import fetchAndInitSpreadsheet from "methods/fetchAndInitSpreadsheet";
import InitSheets from "pages/_Init/InitSheets";
import SelectSheets from "pages/_Init/SelectSheets";
import SelectSpreadsheet from "pages/_Init/SelectSpreadsheet";
import Donation from "pages/Donation";
import Homepage from "pages/Homepage";
import PopupCallback from "pages/PopupCallback";
import Posting from "pages/Posting";
import Settings from "pages/Settings";
import Ticket from "pages/Ticket";
import View from "pages/_ConfessionView";
import { Portal } from "solid-js/web";
import CenteredLoadingCircle from "ui-components/CenteredLoadingCircle";
import About from "pages/About";
import NotificationManager from "controllers/NotificationManager";
import PickerManager from "controllers/PickerManager";
import GoogleAccessTokenManager from "controllers/GoogleAccessTokenManager";

const AuthenticatedRoute: Component = () => {
  createFacebook();
  onMount(async () => {
    const userInfoResponse = (
      await axios.get<{
        email: string;
        email_verified: boolean;
        given_name: string;
        locale: string;
        name: string;
        picture: string;
        sub: string;
      }>(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: {
          Authorization: `Bearer ${gapi.client.getToken().access_token}`,
        },
      })
    ).data;
    // console.log(userInfoResponse);
    setUserData({
      email: userInfoResponse.email,
      displayName: userInfoResponse.name,
      photoUrl: userInfoResponse.picture,
    });
  });
  onMount(async () => {
    /// TODO: FIRE SNACKBAR
    await fetchAndInitSpreadsheet({
      spreadsheetId: await userResourceDatabase.getItem(
        LOCAL_KEY_CONFESSION_SPREADSHEET_ID
      ),
      formId: await userResourceDatabase.getItem(LOCAL_KEY_CONFESSION_FORM_ID),
    });

    gapi.load("picker", async () => {
      setPicker(PickerManager.build());
    });
  });
  return (
    <>
      <Route path={"/*"}>
        <Portal mount={document.getElementById("root-top")!}>
          <div class="h-14 w-full top-0">{"\u200B"}</div>
        </Portal>
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
            <Route path={"/"} element={<View key="pending" ascending />} />
            <Route path={"/accepted"} element={<View key="accepted" />} />
            <Route path={"/declined"} element={<View key="declined" />} />
            <Route
              path={"/posted"}
              element={
                <View
                  key="posted"
                  metadata={{
                    posted: {
                      title: "Các Confession đã đăng",
                      actions: {},
                    },
                  }}
                />
              }
            />
            <Route path={"/posting"} element={<Posting />} />
          </Match>
        </Switch>
        <Route path={"/settings"} element={<Settings />} />
        <Route path={"/ticket"} element={<Ticket />} />
      </Route>
      <NavBar />
      <ChangesPanel />
      <LinkResponses />
    </>
  );
};

let initSetTokenFunction:
  | (() => (obj: { accessToken?: string; isGapi?: boolean }) => any)
  | null = () => {
  let _accessToken: string | false = false;
  let _gapi: boolean | null = null;
  return ({ accessToken, isGapi }) => {
    if (accessToken !== undefined) _accessToken = accessToken;
    if (isGapi) _gapi = isGapi;
    if ((_accessToken === null || _accessToken) && _gapi) {
      batch(() => {
        setGapiLoaded(true);
        GoogleAccessTokenManager.setToken(_accessToken as string | null);
      });
      initSetTokenFunction = null;
    }
  };
};

const App: Component = () => {
  const setTokenFunction = initSetTokenFunction!();

  const handleGapiLoaded = () => {
    if (isGapiLoaded()) return;
    gapi.load("client", async () => {
      await gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
      });
      setTokenFunction({
        isGapi: true,
      });
    });
  };

  createGoogleApi(handleGapiLoaded);

  onMount(() => {
    const refreshAccessToken = async () => {
      try {
        const response = await axios.get(APP_SERVER_URL + "/auth", {
          withCredentials: true,
        });

        /// TODO: check type of this

        const accessToken = response.data.access_token;

        setTimeout(
          refreshAccessToken,
          // Refresh 30 second earlier
          (response.data.expires_in - 30) * 1000
        );
        return accessToken;
      } catch (err) {
        console.error(err);
        return null;
      }
    };

    refreshAccessToken().then((accessToken) =>
      setTokenFunction({ accessToken })
    );
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
      NotificationManager.handlePushMessage(payload);
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
    await NotificationManager.getMessagingToken();
  });

  return (
    <Routes>
      <Switch fallback={<CenteredLoadingCircle />}>
        <Match when={isGapiLoaded()}>
          <Switch>
            <Match when={!loggedIn()}>
              <Route path={"/*"} element={<Homepage />} />
            </Match>
            <Match when={loggedIn()}>
              <AuthenticatedRoute />
            </Match>
          </Switch>
        </Match>
      </Switch>
      <Route path={"/callback"} element={<PopupCallback />} />
      <Route path={"/about"} element={<About />} />
      <Route path={"/donation"} element={<Donation />}></Route>
    </Routes>
  );
};

export default App;
