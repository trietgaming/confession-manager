import { BASE_URL, APP_SERVER_URL, GOOGLE_API_SCOPES } from "app-constants";
import GoogleAccessTokenManager from "controllers/GoogleAccessTokenManager";

const receiveMessage = (event: MessageEvent<any>) => {
  if (event.origin !== BASE_URL) {
    return;
  }
  const { data } = event;
  if (!data?.accessToken) return;

  // console.log(data);

  if (event.isTrusted) {
    GoogleAccessTokenManager.setToken(data.accessToken);
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

  window.addEventListener("message", receiveMessage, false);
  previousUrl = url;
};
const OAUTH2_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const WINDOW_TARGET = "confesison-manager-login";

export default async function handleLogin() {
  const form = document.createElement("form");
  form.setAttribute("method", "GET");
  form.setAttribute("action", OAUTH2_ENDPOINT);
  form.setAttribute("target", WINDOW_TARGET);

  const params = {
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: APP_SERVER_URL + "/auth/handler",
    response_type: "code",
    scope: GOOGLE_API_SCOPES,
    include_granted_scopes: "true",
    prompt: "consent",
    access_type: "offline",
    flowName: "GeneralOAuthFlow",
  };

  for (const p in params) {
    const input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", p);
    input.setAttribute("value", params[p as keyof typeof params]);
    form.appendChild(input);
  }

  openSignInWindow("", WINDOW_TARGET);
  document.body.appendChild(form);
  form.submit();
  form.remove();
}
