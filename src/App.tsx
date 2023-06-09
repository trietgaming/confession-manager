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
  LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS,
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import axios from "axios";
import CenteredLoadingCircle from "ui-components/CenteredLoadingCircle";
import PopupCallback from "pages/PopupCallback";
import createGoogleApi from "app-hooks/createGoogleApi";
import setAccessToken from "methods/setAccessToken";
import NavBar from "components/NavBar";
import localforage from "localforage";
import Settings from "pages/Settings";
import initConfessionSpreadsheetMetadata from "methods/initConfessionSpreadsheetMetadata";
import getLinkedFormIdFromSheet from "methods/getLinkedFormIdFromSheet";
import getMessagingToken from "methods/getMessagingToken";
import subscribeToNotification from "methods/subscribeToNotification";
import unsubscribeToNotification from "methods/unsubscribeToNotification";
import checkNotificationSubscribed from "methods/checkNotificationSubscribed";

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

    const localNotificationKey = await localforage.getItem(
      LOCAL_KEY_NOTIFICATION_TOKEN
    );
    const subscribedForms: string[] | null = await localforage.getItem(
      LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS
    );
    if (
      !localNotificationKey &&
      (!subscribedForms || subscribedForms.length === 0)
    )
      return;

    const messaging = getMessaging(app);

    // TODO: Handle update and focus new confession when notification is pushed
    onMessage(messaging, (payload) => {
      if (payload.data?.attributes) {
      }
      console.log("MESSAGE: ", payload);
    });

    const messagingToken = await getMessagingToken();

    if (
      localNotificationKey !== null &&
      localNotificationKey !== messagingToken
    ) {
      const localSubscribedForms: string[] | null = await localforage.getItem(
        LOCAL_KEY_NOTIFICATION_SUBSCRIBED_FORMS
      );
      if (!localSubscribedForms || !localSubscribedForms.length) {
        return localforage.setItem(
          LOCAL_KEY_NOTIFICATION_TOKEN,
          messagingToken
        );
      }
      // TODO: Optimize this

      const authListener = async (e: MessageEvent) => {
        if (e.data !== "authStateChanged") return;
        await Promise.all(
          localSubscribedForms.map((formId) =>
            unsubscribeToNotification(formId)
          )
        );
        await localforage.setItem(LOCAL_KEY_NOTIFICATION_TOKEN, messagingToken);
        for (const formId of localSubscribedForms) {
          subscribeToNotification(formId);
        }
        window.removeEventListener("message", authListener);
      };
      window.addEventListener("message", authListener);
    }
  });

  createEffect(() => console.log(loggedIn()));

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
