import { Component, Match, Switch } from "solid-js";
import createGoogle from "app-hooks/createGoogle";
import { setTokenClient, tokenClient, setLoggedIn, loggedIn } from "./store";
import { Routes, Route } from "@solidjs/router";
import Login from "./pages/Login";
import Dashboard from "pages/Dashboard";
import ChangesPanel from "components/ChangesPanel";

const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];
const SCOPES =
  "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly";

const App: Component = () => {
  const handleGapiLoaded = () => {
    gapi.load("client", async () => {
      await gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
      });
    });
  };
  const handleGisLoaded = () => {
    setTokenClient(
      google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (resp) => {
          setLoggedIn(true);
        },
      })
    );
  };

  createGoogle(handleGapiLoaded, handleGisLoaded);

  return (
    <Switch>
      <Match when={!tokenClient()}>Loading...</Match>
      <Match when={tokenClient()}>
        <Routes>
          <Route path={"/about"} element={<div>hello</div>} />
          <Switch>
            <Match when={!loggedIn()}>
              <Route path={"/*"} element={<Login />} />
            </Match>
            <Match when={loggedIn()}>
              <Route path={"/"} element={<Dashboard />} />
              <ChangesPanel />
            </Match>
          </Switch>
        </Routes>
      </Match>
    </Switch>
  );
};

export default App;
