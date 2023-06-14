import { Component, splitProps } from "solid-js";
import { ActionButtonMetadata, HandleAction } from "types";
import Button from "ui-components/Button";
import Confession from "classes/Confesison";

const ConfessionComponent: Component<{
  confession: Confession;
  handleAction: HandleAction;
  primaryAction: ActionButtonMetadata;
  secondaryAction: ActionButtonMetadata;
}> = (props) => {
  const [
    { confession, handleAction, primaryAction, secondaryAction },
    otherProps,
  ] = splitProps(props, [
    "confession",
    "handleAction",
    "primaryAction",
    "secondaryAction",
  ]);

  return (
    <li class="self-center" {...otherProps} ref={confession.ref}>
      <div class="my-4 max-w-2xl p-6 bg-white border border-gray-200 rounded-lg shadow-lg basis-6/12">
        <p class="mb-2 text-xl tracking-tight text-gray-900">
          {confession.getData()}
        </p>
        <p class="mb-3 font-normal text-gray-600 text-md">
          {confession.getTimestamp()}
        </p>
        <Button
          onClick={() => handleAction(primaryAction.key, confession)}
          class="mr-2"
        >
          {primaryAction.title}
        </Button>
        <Button
          onClick={() => handleAction(secondaryAction.key, confession)}
          class="bg-white hover:bg-sky-200 text-black border-sky-400 border"
        >
          {secondaryAction.title}
        </Button>
      </div>
    </li>
  );
};

export default ConfessionComponent;
