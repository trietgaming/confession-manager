import { Component } from "solid-js";
import LoadingCircle from "./LoadingCircle";

const CenteredLoadingCircle: Component = () => {
  return (
    <div class="absolute right-1/2 bottom-1/2 translate-x-1/2 translate-y-1/2">
      <LoadingCircle />
    </div>
  );
};

export default CenteredLoadingCircle;
