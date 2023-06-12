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
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import axios from "axios";
import CenteredLoadingCircle from "ui-components/CenteredLoadingCircle";
import PopupCallback from "pages/PopupCallback";
import createGoogleApi from "app-hooks/createGoogleApi";
import setAccessToken from "methods/setAccessToken";
import NavBar from "components/NavBar";
import { localData, userResourceDatabase } from "local-database";
import Settings from "pages/Settings";
import initConfessionSpreadsheetMetadata from "methods/initConfessionSpreadsheetMetadata";
import getLinkedFormIdFromSheet from "methods/getLinkedFormIdFromSheet";
import getMessagingToken from "methods/getMessagingToken";

const AuthenticatedWrapper: Component = () => {
  onMount(async () => {
    /// TODO: FIRE SNACKBAR
    const getForm = async (formId: string) =>
      formId
        ? ((await userResourceDatabase.getItem(
            formId
          )) as gapi.client.forms.Form) ||
          (
            await gapi.client.forms.forms.get({
              formId,
              fields: "formId,linkedSheetId,info/documentTitle",
            })
          ).result
        : {};
    const getSpreadsheet = async (spreadsheetId: string) =>
      spreadsheetId
        ? ((await userResourceDatabase.getItem(
            spreadsheetId
          )) as gapi.client.sheets.Spreadsheet) ||
          (
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

      await userResourceDatabase.setItem(
        LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
        spreadsheetId
      );
      await userResourceDatabase.setItem(LOCAL_KEY_CONFESSION_FORM_ID, formId);

      await userResourceDatabase.setItem(form.formId!, form);
      await userResourceDatabase.setItem(
        spreadsheet.spreadsheetId!,
        spreadsheet
      );
    };

    await fetchAndInitSpreadsheet({
      spreadsheetId: await userResourceDatabase.getItem(
        LOCAL_KEY_CONFESSION_SPREADSHEET_ID
      ),
      formId: await userResourceDatabase.getItem(LOCAL_KEY_CONFESSION_FORM_ID),
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

    const localNotificationKey = await localData.getItem(
      LOCAL_KEY_NOTIFICATION_TOKEN
    );
    const subscribedSpreadsheets: string[] | null =
      await userResourceDatabase.getItem(LOCAL_KEY_CONFESSION_SPREADSHEET_ID);
    if (
      !localNotificationKey &&
      (!subscribedSpreadsheets || subscribedSpreadsheets.length === 0)
    )
      return;

    const messaging = getMessaging(app);

    // TODO: Handle update and focus new confession when notification is pushed
    onMessage(messaging, (payload) => {
      if (payload.data?.attributes) {
      }
      console.log("MESSAGE: ", payload);
    });

    // If the token is different from local token, this will make a request to firebase api
    // and the service worker will catch the request to handle it
    await getMessagingToken();
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
