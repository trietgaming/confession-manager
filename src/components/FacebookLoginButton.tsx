import { Component, Show } from "solid-js";
import { isFacebookLoaded } from "store/index";
import Button from "ui-components/Button";

const FacebookLoginButton: Component = () => {
  const handleFBLogin = () => {
    if (FB) {
      FB.login(
        (response) => {
          console.log(response);
        },
        { scope: "public_profile,pages_show_list,pages_manage_posts,pages_read_engagement" }
      );
    }
  };
  return isFacebookLoaded() ? (
    <Button onClick={handleFBLogin}>Liên kết</Button>
  ) : null;
};

export default FacebookLoginButton;
