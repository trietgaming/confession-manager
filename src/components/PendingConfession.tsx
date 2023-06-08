import { Component, splitProps } from "solid-js";
import { Confession, HandleAction } from "types";
import Button from "ui-components/Button";
import { PENDING_CONFESSION_ACTION } from "../constants";

const PendingConfession: Component<{
  confession: Confession;
  handleAction: HandleAction;
}> = (props) => {
  const [{ confession, handleAction }, otherProps] = splitProps(props, [
    "confession",
    "handleAction",
  ]);
  const { row, data, date } = confession;
  let cfsRef: HTMLLIElement;

  return (
    <li class="self-center" {...otherProps} ref={cfsRef!}>
      <div class="my-4 max-w-2xl p-6 bg-white border border-gray-200 rounded-lg shadow-lg basis-6/12">
        <p class="mb-2 text-xl tracking-tight text-gray-900">{data}</p>
        <p class="mb-3 font-normal text-gray-600 text-md">{date}</p>
        <Button
          onClick={() =>
            handleAction(
              PENDING_CONFESSION_ACTION.ACCEPT,
              confession,
              cfsRef
            )
          }
          class="bg-green-600 hover:bg-green-700 mr-2"
        >
          Duyệt
        </Button>
        <Button
          onClick={() =>
            handleAction(
              PENDING_CONFESSION_ACTION.DECLINE,
              confession,
              cfsRef
            )
          }
          class="bg-red-500 hover:bg-red-700"
        >
          Bỏ
        </Button>
      </div>
    </li>
  );
};

export default PendingConfession;
