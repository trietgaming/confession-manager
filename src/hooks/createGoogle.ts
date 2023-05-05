import { onMount } from "solid-js";

const createAndMountScript = (src: string, onLoadCallback: () => any) => {
  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.addEventListener("load", onLoadCallback, {
    once: true,
  });
  script.src = src;
  document.body.appendChild(script);
};

function createGoogle(
  gapiLoadedCallback: () => any,
  gsiLoadedCallback: () => any
) {
  onMount(async () => {
    createAndMountScript(
      "https://apis.google.com/js/api.js",
      gapiLoadedCallback
    );
    createAndMountScript(
      "https://accounts.google.com/gsi/client",
      gsiLoadedCallback
    );
  });
}

export default createGoogle;
