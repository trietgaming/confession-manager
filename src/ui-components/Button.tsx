import { ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

const Button: ParentComponent<{
  onClick?: () => any;
  disabled?: boolean;
  class?: string;
}> = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);
  return (
    <button
      class={twMerge(
        `disabled:cursor-not-allowed disabled:bg-blue-200 disabled:hover:bg-blue-200 text-white text-base bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5`,
        local.class
      )}
      {...others}
    >
      {local.children}
    </button>
  );
};

export default Button;
