import { Component, Accessor, Show, createEffect } from "solid-js";
import Button from "ui-components/Button";
import LoadingCircle from "ui-components/LoadingCircle";

const SelectSpreadsheet: Component<{
  handlePick: () => any;
  isLoading: boolean;
}> = (props) => {
  return (
    <div class="flex flex-col justify-center h-full">
      <div class="flex px-4 flex-col items-center justify-center">
        <h1 class="text-2xl mb-10">
          Chọn một bảng tính chứa câu trả lời Confession hoặc biểu mẫu nhận
          Confession để bắt đầu
        </h1>
        <Button
          onClick={props.handlePick}
          disabled={props.isLoading}
          class="text-xl text-white bg-[#4285F4] hover:bg-[#4285F4]/90 px-7 py-5 text-center inline-flex items-center"
        >
          <Show when={!props.isLoading} fallback={<LoadingCircle />}>
            Chọn bảng tính hoặc biểu mẫu
          </Show>
        </Button>
      </div>
    </div>
  );
};

export default SelectSpreadsheet;
