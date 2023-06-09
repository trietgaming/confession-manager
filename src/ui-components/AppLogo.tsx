import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";
import APP_LOGO_URL from "../assets/icons/confession-manager-icon.svg";

const AppLogo: Component<{
  class?: string;
}> = (props) => {
  return (
    <img
      src={APP_LOGO_URL}
      alt="App Logo"
      class={twMerge("w-8 h-8", props.class)}
    />
  );
};

export default AppLogo;
