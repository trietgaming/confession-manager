import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";

const AppLogo: Component<{
  class?: string;
}> = (props) => {
  return (
    <img
      src="icons/confession-manager-icon.svg"
      alt="App Logo"
      class={twMerge("w-8 h-8", props.class)}
    />
  );
};

export default AppLogo;
