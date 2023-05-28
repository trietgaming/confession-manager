import { Component, Match, Switch, onMount } from "solid-js";
import {
  loggedIn,
  setGapiLoaded,
  isGapiLoaded,
  setServiceWorkerRegistered,
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
  LOCAL_KEY_NOTIFICATION_TOKEN,
} from "app-constants";
import axios from "axios";
import CenteredLoadingCircle from "ui-components/CenteredLoadingCircle";
import PopupCallback from "pages/PopupCallback";
import createGoogleApi from "app-hooks/createGoogleApi";
import setAccessToken from "methods/setAccessToken";
import NavBar from "pages/NavBar";
import localforage from "localforage";

const NavBarWrapper: Component = () => {
  return (
    <div class="md:translate-y-10">
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
      }
    });
  };

  createGoogleApi(handleGapiLoaded);
  onMount(async () => {
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
    } catch (err) {
      return console.error(err);
    }
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

    window.addEventListener("message", async () => {
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
              <Route path={"/*"} element={<NavBarWrapper />}>
                <Route path={"/"} element={<Dashboard />} />
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
