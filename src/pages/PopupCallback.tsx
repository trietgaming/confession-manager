import { useNavigate } from "@solidjs/router";
import { Component, onMount } from "solid-js";
import CenteredLoadingCircle from "ui-components/CenteredLoadingCircle";

const PopupCallback: Component = () => {
  const navigate = useNavigate();
  onMount(() => {
    const search = new URLSearchParams(window.location.search);
    const accessToken = search.get("access_token");
    if (!accessToken) {
      return navigate("/");
    }
    if (window.opener) {
      // send them to the opening window
      window.opener.postMessage(accessToken);
      // close the popup
      window.close();
      navigate("/");
    }
  });
  return <CenteredLoadingCircle />;
};

export default PopupCallback;
