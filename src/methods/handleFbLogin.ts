import { FACEBOOK_API_SCOPES } from "app-constants";
import fetchFacebookUserFromAuthResponse from "./fetchFacebookUserFromAuthResponse";

export default function handleFbLogin() {
  return new Promise((resolve) => {
    FB.login(
      (response) => {
        fetchFacebookUserFromAuthResponse(response).then((user) =>
          resolve(user)
        );
      },
      {
        scope: FACEBOOK_API_SCOPES,
        enable_profile_selector: true,
      }
    );
  });
}
