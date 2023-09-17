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

/**
 * @deprecated
 */
function createGoogleApi(gapiLoadedCallback: () => any) {
  createAndMountScript("https://apis.google.com/js/api.js", gapiLoadedCallback);
}

export default createGoogleApi;
