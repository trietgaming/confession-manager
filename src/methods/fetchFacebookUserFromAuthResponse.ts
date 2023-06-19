import { reconcile } from "solid-js/store";
import {
  accessibleFacebookPages,
  confessionSpreadsheet,
  facebookUser,
  setAccessibleFacebookPages,
  setFacebookUser,
} from "store/index";
import initCurrentPage from "./initCurrentPage";

export default function fetchFacebookUserFromAuthResponse(
  response: fb.StatusResponse
) {
  return new Promise((resolve) => {
    if (response.status === "connected") {
      FB.api("/me", { fields: ["name", "id", "link"] }, (user) => {
        setFacebookUser(user as unknown as typeof facebookUser);
        console.log(user);
        FB.api(
          `me/accounts`,
          {
            fields: [],
          },
          (response: { data: typeof accessibleFacebookPages }) => {
            console.log(response);
            setAccessibleFacebookPages(reconcile(response.data));
            initCurrentPage();
          }
        );
        resolve(user);
      });
    } else {
      setFacebookUser(null);
      resolve(null);
    }
  });
}
