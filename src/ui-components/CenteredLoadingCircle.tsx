import { Component } from "solid-js";
import LoadingCircle from "./LoadingCircle";
import { Portal } from "solid-js/web";

const CenteredLoadingCircle: Component = () => {
  return (
    <Portal>
      <div class="absolute right-1/2 bottom-1/2 translate-x-1/2 translate-y-1/2 z-10">
        <LoadingCircle class="w-9 h-9" />
      </div>
    </Portal>
  );
};

export default CenteredLoadingCircle;
