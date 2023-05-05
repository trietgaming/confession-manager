import { Component } from "solid-js";
import { Confession, HandleAction } from "types";
import Button from "ui-components/Button";
import { PENDING_CONFESSION_ACTION } from "../constants";

const PendingConfession: Component<{
  confession: Confession;
  handleAction: HandleAction;
}> = (props) => {
  const { row, data, date } = props.confession;

  return (
    <li class="self-center" {...props}>
      <div class="my-4 max-w-2xl p-6 bg-white border border-gray-200 rounded-lg shadow-lg basis-6/12">
        <p class="mb-2 text-xl tracking-tight text-gray-900">{data}</p>
        <p class="mb-3 font-normal text-gray-600 text-md">{date}</p>
        <Button
          onClick={() =>
            props.handleAction(
              PENDING_CONFESSION_ACTION.ACCEPT,
              props.confession
            )
          }
          class="bg-green-600 hover:bg-green-700"
        >
          Duyệt
        </Button>
        <Button
          onClick={() =>
            props.handleAction(
              PENDING_CONFESSION_ACTION.DECLINE,
              props.confession
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
