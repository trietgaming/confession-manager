import { useNavigate } from "@solidjs/router";
import { BASE_URL } from "app-constants";
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
    if (
      window.opener &&
      (window.opener.origin as string | undefined)?.startsWith(BASE_URL)
    ) {
      // send them to the opening window
      window.opener.postMessage({ accessToken });
      // close the popup
      window.close();
    }
  });
  return <CenteredLoadingCircle />;
};

export default PopupCallback;
