import { isGapiLoaded, setLoggedIn } from "store/index";

export default function setAccessToken(token: string | null) {
  if (!isGapiLoaded()) return;
  window.postMessage("authStateChanged");
  if (token === null) {
    gapi.client.setToken(null);
    setLoggedIn(false);
    return;
  }
  gapi.client.setToken({ access_token: token });
  setLoggedIn(true);
}
