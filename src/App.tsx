import { Component, Match, Switch, batch, onMount } from "solid-js";
import {
  loggedIn,
  setGapiLoaded,
  isGapiLoaded,
  setServiceWorkerRegistered,
  setConfessionSpreadsheet,
  confesisonForm,
  setPicker,
  setConfessionForm,
  setPicking,
  // setPushEnabled,
} from "./store";
import { Routes, Route, Outlet } from "@solidjs/router";
import Login from "./pages/Login";
import Dashboard from "pages/Dashboard";
import ChangesPanel from "components/ChangesPanel";
// import LoadingCircle from "ui-components/LoadingCircle";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
  APP_SERVER_URL,
  DISCOVERY_DOCS,
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import axios from "axios";
import CenteredLoadingCircle from "ui-components/CenteredLoadingCircle";
import PopupCallback from "pages/PopupCallback";
import createGoogleApi from "app-hooks/createGoogleApi";
import setAccessToken from "methods/setAccessToken";
import NavBar from "pages/NavBar";
import localforage from "localforage";
import Settings from "pages/Settings";
import initConfessionSpreadsheetMetadata from "methods/initConfessionSpreadsheetMetadata";
import getLinkedFormIdFromSheet from "methods/getLinkedFormIdFromSheet";

const AuthenticatedWrapper: Component = () => {
  onMount(async () => {
    /// TODO: FIRE SNACKBAR
    const getForm = async (formId: string) =>
      formId
        ? (
            await gapi.client.forms.forms.get({
              formId,
              fields: "formId,linkedSheetId,info/documentTitle",
            })
          ).result
        : {};
    const getSpreadsheet = async (spreadsheetId: string) =>
      spreadsheetId
        ? (
            await gapi.client.sheets.spreadsheets.get({
              spreadsheetId,
            })
          ).result
        : {};

    const fetchAndInitSpreadsheet = async ({
      spreadsheetId,
      formId,
    }: {
      spreadsheetId?: string | null;
      formId?: string | null;
    }) => {
      if (!spreadsheetId && !formId) return;

      const form = await getForm(
        formId || (await getLinkedFormIdFromSheet(spreadsheetId!))!
      );
      if (!form.linkedSheetId) return;
      const spreadsheet = await getSpreadsheet(
        spreadsheetId || form.linkedSheetId!
      );

      batch(() => {
        setConfessionSpreadsheet(spreadsheet);
        initConfessionSpreadsheetMetadata();
        setConfessionForm(form);
      });

      formId = form.formId;
      spreadsheetId = spreadsheet.spreadsheetId;

      await localforage.setItem(
        LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
        spreadsheetId
      );
      await localforage.setItem(LOCAL_KEY_CONFESSION_FORM_ID, formId);
    };

    await fetchAndInitSpreadsheet({
      spreadsheetId: await localforage.getItem(
        LOCAL_KEY_CONFESSION_SPREADSHEET_ID
      ),
      formId: await localforage.getItem(LOCAL_KEY_CONFESSION_FORM_ID),
    });

    gapi.load("picker", async () => {
      const pickerCallback = async (res: google.picker.ResponseObject) => {
        setPicking(true);
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          console.log(res);
          await fetchAndInitSpreadsheet({
            /// @ts-ignore
            [res.docs[0].serviceId === "form" ? "formId" : "spreadsheetId"]:
              res.docs[0].id,
          });
        }
        setPicking(false);
      };
      setPicker(
        new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.SPREADSHEETS)
          .addView(google.picker.ViewId.FORMS)
          .setMaxItems(1)
          .setOAuthToken(gapi.client.getToken().access_token)
          .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
          .setCallback(pickerCallback)
          .setTitle(
            "Chọn bảng tính hoặc biểu mẫu nhận câu trả lời Confession của bạn"
          )
          .build()
      );
    });
  });
  return (
    <div class="md:translate-y-14">
      <Outlet />
    </div>
  );
};

const App: Component = () => {
  let existed_access_token: string | null = null;
  const handleGapiLoaded = () => {
    if (isGapiLoaded()) return;
    gapi.load("client", async () => {
      await gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
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
          if (isGapiLoaded()) setAccessToken(accessToken);
          else existed_access_token = accessToken;
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
      apiKey: "AIzaSyAnPO6_ZDiVdNOOYEZShljjd8cdqKyNlAc",
      authDomain: "confession-manager.firebaseapp.com",
      projectId: "confession-manager",
      storageBucket: "confession-manager.appspot.com",
      messagingSenderId: "1041449841105",
      appId: "1:1041449841105:web:43b9b359bea7eb95afb0f0",
      measurementId: "G-Z8MBF96X25",
    });

    const messaging = getMessaging(app);

    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          type: "module",
        });
      } catch (err) {
        console.error(err);
      }
    }
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;

    const messagingToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      serviceWorkerRegistration,
    });
    setServiceWorkerRegistered(true);

    // TODO: Handle update and focus new confession when notification is pushed
    onMessage(messaging, (payload) => {
      if (payload.data?.attributes) {
      }
      console.log("MESSAGE: ", payload);
    });

    let localNotificationKey = await localforage.getItem(
      LOCAL_KEY_NOTIFICATION_TOKEN
    );

    if (localNotificationKey !== messagingToken) {
      await localforage.setItem(LOCAL_KEY_NOTIFICATION_TOKEN, messagingToken);
      const localNotificationFormId = await localforage.getItem(
        LOCAL_KEY_CONFESSION_FORM_ID
      );
      if (!localNotificationFormId) {
        return;
      }
      // TODO: handle send new token key to server
    }

    if (localNotificationKey === null) {
      await localforage.setItem(LOCAL_KEY_NOTIFICATION_TOKEN, messagingToken);
    }
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
              <Route path={"/*"} element={<AuthenticatedWrapper />}>
                <Route path={"/"} element={<Dashboard />} />
                <Route path={"/settings"} element={<Settings />} />
              </Route>
              <NavBar />
              <ChangesPanel />
            </Match>
          </Switch>
        </Match>
      </Switch>
    </Routes>
  );
};

export default App;
