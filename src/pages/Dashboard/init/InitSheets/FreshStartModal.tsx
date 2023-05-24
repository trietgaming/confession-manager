import { Component, createEffect, createSignal, JSX } from "solid-js";
import Modal from "ui-components/Modal";

const FreshStartModal: Component<{
  title: string;
  isShow?: boolean;
  handleClose?: () => any;
}> = (props) => {
  const [sheetTitle, setSheetTitle] = createSignal("");

  const handleChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = (e) => {
    setSheetTitle(e.target.value);
  };

  const handleSubmit = () => {};

  return (
    <Modal
      title={props.title}
      isShow={props.isShow}
      handleClose={props.handleClose}
    >
      <label
        for="title-input"
        class="block mb-2 text-sm font-medium text-gray-900"
      >
        Tiêu đề trang tính lưu trữ các confession cũ
      </label>
      <input
        type="text"
        id="title-input"
        class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500"
        value={sheetTitle()}
        onInput={handleChange}
      />
    </Modal>
  );
};

export default FreshStartModal;
