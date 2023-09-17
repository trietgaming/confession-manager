import axios from "axios";
import AppScriptApi from "controllers/AppScriptApi";
import fetchAndInitSpreadsheet from "methods/fetchAndInitSpreadsheet";
import {
  Component,
  JSX,
  createEffect,
  createMemo,
  createSignal
} from "solid-js";
import { linkResponsesShow, setLinkResponsesShow } from "store/index";
import Modal from "ui-components/Modal";

const LinkResponses: Component<{}> = (props) => {
  const from = createMemo(() =>
    linkResponsesShow()?.formId ? "Biểu mẫu" : "Bảng tính"
  );
  const to = createMemo(() =>
    linkResponsesShow()?.formId ? "Bảng tính" : "Biểu mẫu"
  );
  const [targetTitle, settargetTitle] = createSignal("");
  const [isLoading, setLoading] = createSignal(false);
  createEffect(() => {});

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (
    e
  ) => {
    settargetTitle(e.currentTarget.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const title = targetTitle();

    try {
      if (linkResponsesShow()?.formId) {
        const formId = linkResponsesShow()!.formId!;
        const newSpreadsheet = (
          await gapi.client.sheets.spreadsheets.create(
            {},
            {
              properties: {
                title,
              },
            }
          )
        ).result;
        await AppScriptApi.linkFormToSpreadsheet(
          formId,
          newSpreadsheet.spreadsheetId!
        );
        await fetchAndInitSpreadsheet({
          spreadsheetId: newSpreadsheet.spreadsheetId,
          formId,
        });
      } else if (linkResponsesShow()?.spreadsheetId) {
        const spreadsheetId = linkResponsesShow()!.spreadsheetId!;
        const newForm = (
          await axios.post<gapi.client.forms.Form>(
            "https://forms.googleapis.com/v1/forms",
            {
              info: {
                title,
                documentTitle: title,
              },
            } as gapi.client.forms.Form,
            {
              headers: {
                Authorization: `Bearer ${gapi.client.getToken().access_token}`,
              },
            }
          )
        ).data;
        await AppScriptApi.linkFormToSpreadsheet(
          newForm.formId!,
          spreadsheetId
        );
        await fetchAndInitSpreadsheet({
          spreadsheetId,
          formId: newForm.formId,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra");
    }
    setLinkResponsesShow(null);
    setLoading(false);
  };

  return (
    <Modal
      title={`Liên kết đến ${to()}`}
      handleClose={() => setLinkResponsesShow(null)}
      handleSubmit={handleSubmit}
      isShow={!!linkResponsesShow()}
      loading={isLoading()}
    >
      <h1 class="text-xl">
        {from()} đã chọn chưa liên kết với {to()} nào.
      </h1>
      <p class="my-2">
        Để liên kết {from()} này với một {to()} mới, hãy đặt tiêu đề cho {to()}{" "}
        và bấm "Xác nhận". Nếu bạn không muốn liên kết, hãy chọn một Biểu mẫu
        hoặc Bảng tính khác.
      </p>
      <label for="targetTitle">Tiêu đề {to()}</label>
      <input
        type="text"
        id="targetTitle"
        class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500"
        value={targetTitle()}
        onInput={handleInput}
      />
    </Modal>
  );
};

export default LinkResponses;
