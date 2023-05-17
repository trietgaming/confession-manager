import { APP_SERVER_URL, BASE_URL } from "app-constants";
import setAccessToken from "./setAccessToken";

const receiveMessage = (event: MessageEvent<any>) => {
  if (event.origin !== BASE_URL) {
    return;
  }
  const { data } = event;

  // console.log(data);

  if (event.isTrusted) {
    setAccessToken(data);
  }
};

let windowObjectReference: Window | null = null;
let previousUrl: string | null = null;

const openSignInWindow = (url: string, name: string) => {
  window.removeEventListener("message", receiveMessage);

  const strWindowFeatures =
    "toolbar=no, menubar=no, width=600, height=700, top=100, left=100";

  if (windowObjectReference === null || windowObjectReference.closed) {
    windowObjectReference = window.open(url, name, strWindowFeatures);
  } else if (previousUrl !== url) {
    windowObjectReference = window.open(url, name, strWindowFeatures);
    windowObjectReference!.focus();
  } else {
    windowObjectReference.focus();
  }

  window.addEventListener("message", (event) => receiveMessage(event), false);
  previousUrl = url;
};

/// TODO: find out what is "name" arg
export default async () => {
  openSignInWindow(APP_SERVER_URL + "/auth/login", "cfs-manager-popup-login");
};
