import FacebookAccountManager from "controllers/FacebookAccountManager";
import { setFacebookLoaded } from "store/index";

const createAndMountScript = (src: string) => {
  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.src = src;
  script.crossOrigin = "anonymous";
  script.nonce = "VWujw6S9";
  document.body.appendChild(script);
};

/**
 * @deprecated
 */
const createFacebook = () => {
  window.fbAsyncInit = function () {
    setFacebookLoaded(true);
    FB.init({
      appId: "1408546916589447",
      autoLogAppEvents: true,
      xfbml: true,
      version: "v17.0",
      status: true,
    });

    FB.getLoginStatus(async (response) => {
      await FacebookAccountManager.fetchFacebookUserFromAuthResponse(response);
    });

    console.log("FB loaded");
  };
  createAndMountScript("https://connect.facebook.net/vi_VN/sdk.js");
};

export default createFacebook;
