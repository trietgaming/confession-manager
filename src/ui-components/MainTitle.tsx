import { ParentComponent } from "solid-js";

const MainTitle: ParentComponent = (props) => {
  return (
    <h1 class="text-center my-8 text-4xl font-bold w-full">{props.children}</h1>
  );
};

export default MainTitle;
