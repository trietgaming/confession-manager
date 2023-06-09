import { Component } from "solid-js";

const Toggle: Component<{
  class?: string;
  checked?: boolean;
  disabled?: boolean;
  handleToggle?: () => any;
}> = (props) => {
  return (
    <label class="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        class="sr-only peer"
        checked={props.checked}
        disabled={props.disabled}
        onClick={props.handleToggle}
      />
      <div class="w-11 h-6 bg-gray-300 peer-disabled:bg-gray-100 peer-disabled:cursor-not-allowed peer-disabled:after:border-gray-200 peer-disabled:after:bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 peer-checked:after:left-2 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );
};

export default Toggle;
