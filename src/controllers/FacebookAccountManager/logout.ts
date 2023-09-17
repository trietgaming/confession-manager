import { batch } from "solid-js";
import { reconcile } from "solid-js/store";
import {
  facebookUser,
  setAccessibleFacebookPages,
  setCurrentConfessionPage,
  setFacebookUser,
} from "store/index";

export default function handleFBLogout() {
  if (!facebookUser()) return;
  return new Promise((resolve, reject) => {
    FB.logout((response) => {
      if (response.status !== "connected") {
        batch(() => {
          setFacebookUser(null);
          setAccessibleFacebookPages(reconcile([]));
          setCurrentConfessionPage(undefined);
        });
        resolve(void 0);
      } else {
        reject("Unexpected error when Logout");
      }

      console.log(response);
    });
  });
}
