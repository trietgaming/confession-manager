import { ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

const MainTitle: ParentComponent<{
  class?: string;
}> = (props) => {
  return (
    <h1
      class={twMerge("text-center my-8 text-4xl font-bold w-full", props.class)}
    >
      {props.children}
    </h1>
  );
};

export default MainTitle;
