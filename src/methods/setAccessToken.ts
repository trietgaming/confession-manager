import { isGapiLoaded, setLoggedIn } from "store/index";

export default function setAccessToken(token: string | null) {
  // console.log(token);
  window.postMessage("authStateChanged");
  if (!isGapiLoaded()) return;
  if (token === null) {
    gapi.client.setToken(null);
    setLoggedIn(false);
    return;
  }
  gapi.client.setToken({ access_token: token });
  setLoggedIn(true);
}
