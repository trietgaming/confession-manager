import { Component, Match, Switch, onMount } from "solid-js";
import { loggedIn, setGapiLoaded, isGapiLoaded } from "./store";
import { Routes, Route } from "@solidjs/router";
import Login from "./pages/Login";
import Dashboard from "pages/Dashboard";
import ChangesPanel from "components/ChangesPanel";
import LoadingCircle from "ui-components/LoadingCircle";
// import { initializeApp } from "firebase/app";
// import {
//   initializeAuth,
//   browserPopupRedirectResolver,
//   browserLocalPersistence,
// } from "firebase/auth";
import { APP_SERVER_URL, DISCOVERY_DOCS } from "app-constants";
import axios from "axios";
import CenteredLoadingCircle from "ui-components/CenteredLoadingCircle";
import PopupCallback from "pages/PopupCallback";
import createGoogleApi from "app-hooks/createGoogleApi";
import setAccessToken from "methods/setAccessToken";
import NavBar from "pages/NavBar";

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

  return (
    <Switch fallback={<CenteredLoadingCircle />}>
      <Match when={isGapiLoaded()}>
        <Routes>
          <Route path={"/about"} element={<div>hello</div>} />
          <Switch>
            <Match when={!loggedIn()}>
              <Route path={"/callback"} element={<PopupCallback />} />
              <Route path={"/*"} element={<Login />} />
            </Match>
            <Match when={loggedIn()}>
              <Route path={"/"} element={<Dashboard />} />
              <NavBar />
              <ChangesPanel />
            </Match>
          </Switch>
        </Routes>
      </Match>
    </Switch>
  );
};

export default App;
