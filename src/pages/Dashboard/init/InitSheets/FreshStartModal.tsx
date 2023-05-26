import { Component, createEffect, createSignal, JSX } from "solid-js";
import { confessionMetadata, confessionSpreadsheet } from "store/index";
import Modal from "ui-components/Modal";

const FreshStartModal: Component<{
  title: string;
  isShow?: boolean;
  handleClose?: () => any;
}> = (props) => {
  const [sheetTitle, setSheetTitle] = createSignal("");
  const [isLoading, setLoading] = createSignal(false);

  const handleChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = (e) => {
    setSheetTitle(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const archiveSheetTitle = sheetTitle();
    const addSheetResult = (await gapi.client.sheets.spreadsheets.batchUpdate(
      {
        spreadsheetId: confessionSpreadsheet.spreadsheetId!,
      },
      {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle(),
              },
            },
          },
        ],
      }
    )).result;
    confessionMetadata.pendingSheet;
    setLoading(false);
  };

  return (
    <Modal
      title={props.title}
      isShow={props.isShow}
      handleClose={props.handleClose}
      handleSubmit={handleSubmit}
      loading={isLoading()}
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
