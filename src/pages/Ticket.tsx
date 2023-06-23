import { APP_SERVER_URL } from "app-constants";
import axios from "axios";
import {
  Component,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { createStore } from "solid-js/store";
import { userData } from "store/index";
import Button from "ui-components/Button";
import LoadingCircle from "ui-components/LoadingCircle";
import MainTitle from "ui-components/MainTitle";
import Toggle from "ui-components/Toggle";

const Ticket: Component = () => {
  const [inputValues, setInputValues] = createStore({
    email: userData.email,
    name: userData.displayName,
    isAnonymous: false,
    ticketType: "",
    title: "",
    description: "",
  });
  const [isSubmitting, setSubmitting] = createSignal(false);
  const canSubmit = createMemo(() => {
    if (
      (!inputValues.isAnonymous &&
        (!inputValues.email?.length || !inputValues.name?.length)) ||
      !inputValues.ticketType.length ||
      !inputValues.title.length ||
      !inputValues.description.length
    )
      return false;
    return true;
  });

  createEffect(() => {
    if (
      userData.email &&
      inputValues.email === undefined &&
      userData.email !== inputValues.email
    )
      setInputValues("email", userData.email);

    if (
      userData.displayName &&
      inputValues.name === undefined &&
      userData.displayName !== inputValues.name
    )
      setInputValues("name", userData.displayName);
  });

  const generateInputFunction = (key: keyof typeof inputValues) => {
    return ((e) =>
      setInputValues(key, e.currentTarget.value)) as JSX.EventHandlerUnion<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
      InputEvent
    >;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(
        APP_SERVER_URL + "/issues",
        {
          ...inputValues,
        },
        {
          headers: {
            Authorization: `Bearer ${gapi.client.getToken().access_token}`,
          },
        }
      );
      setInputValues({
        email: userData.email,
        name: userData.displayName,
        isAnonymous: false,
        ticketType: "",
        title: "",
        description: "",
      });
      alert(
        "Cảm ơn bạn đã gửi yêu cầu, hãy cập nhật phản hồi của chúng tôi tại: " +
          "https://github.com/trietgaming/confession-manager/issues\nSự đóng góp của bạn có ý nghĩa rất lớn đối với sự phát triển của ứng dụng, cảm ơn bạn!"
      );
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra");
    }
    setSubmitting(false);
  };

  return (
    <div class="flex justify-center max-w-4xl mx-auto mt-2">
      <div class="flex flex-col space-y-2 bg-white rounded-md p-4 shadow-lg w-full ">
        <MainTitle class="my-2">Gửi yêu cầu</MainTitle>
        <p class="text-sm text-gray-500">
          Nếu bạn chỉ muốn liên hệ với chúng tôi, hãy liên hệ qua email:{" "}
          <a
            target="_blank"
            href="mailto:triet123vn@gmail.com"
            class="text-blue-500"
          >
            triet123vn@gmail.com
          </a>
          <br />
          Yêu cầu của bạn sẽ được chuyển thành một "Issue" trên{" "}
          <a
            target="_blank"
            href="https://github.com/trietgaming/confession-manager"
            class="text-blue-500"
          >
            trang Github của ứng dụng
          </a>
          . Mọi thông tin bạn cung cấp đều sẽ được công khai, vì vậy hãy bật yêu
          cầu ẩn danh nếu bạn không muốn công khai thông tin cá nhân của bạn.
        </p>
        <div class="flex justify-between items-center">
          <p>Gửi yêu cầu ẩn danh?</p>
          <Toggle
            checked={inputValues.isAnonymous}
            handleToggle={() => setInputValues("isAnonymous", (prev) => !prev)}
          />
        </div>
        <Show when={!inputValues.isAnonymous}>
          <label for="ticket_user_name">Tên của bạn</label>
          <input
            id="ticket_user_name"
            type="text"
            class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:outline-blue-500"
            value={inputValues.name || ""}
            onInput={generateInputFunction("name")}
            maxLength={100}
          />
          <label for="ticket_user_email">Email của bạn</label>
          <input
            id="ticket_user_email"
            type="text"
            class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:outline-blue-500"
            value={inputValues.email || ""}
            onInput={generateInputFunction("email")}
            maxLength={100}
          />
        </Show>
        <label for="ticket_select">Chọn loại yêu cầu</label>
        <select
          id="ticket_select"
          class="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:outline-blue-500 focus:border-blue-500 text-ellipsis block p-2.5 w-full"
          value={inputValues.ticketType}
          onInput={generateInputFunction("ticketType")}
        >
          <option value="" hidden>
            Chọn một
          </option>
          <option value="bug">Báo lỗi</option>
          <option value="enhancement">Góp ý, yêu cầu tính năng</option>
          <option value="other">Khác</option>
        </select>
        <Show when={inputValues.ticketType?.length}>
          <p class="text-sm text-gray-500">
            Nếu chọn yêu cầu "Khác", vui lòng nêu rõ lý do yêu cầu để chúng tôi
            dễ dàng xử lí.
          </p>
          <label for="ticket_title">Tiêu đề (không quá 100 chữ)</label>
          <input
            id="ticket_title"
            type="text"
            class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:outline-blue-500"
            maxLength={100}
            value={inputValues.title}
            onInput={generateInputFunction("title")}
          />
          <label for="ticket_description">Mô tả chi tiết</label>
          <textarea
            id="ticket_description"
            class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:outline-blue-500"
            rows={4}
            maxLength={65536}
            value={inputValues.description}
            onInput={generateInputFunction("description")}
          />
        </Show>
        <p class="text-sm text-gray-500">
          Vui lòng sử dụng tính năng này một cách có ý thức, văn minh - Không
          spam, gửi đúng yêu cầu, sử dụng từ ngữ lịch sự, đi thẳng vào vấn đề.
          Chúng tôi cảm ơn sự đóng góp của bạn!
        </p>
        <p class="text-sm text-gray-500">
          Xem các yêu cầu hiện có tại:{" "}
          <a
            href="https://github.com/trietgaming/confession-manager/issues"
            target="_blank"
            class="text-blue-500"
          >
            https://github.com/trietgaming/confession-manager/issues
          </a>
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit() || isSubmitting()}
          class="flex items-center space-x-2 w-max"
        >
          <p>Gửi yêu cầu</p>
          <Show when={isSubmitting()}>
            <LoadingCircle />
          </Show>
        </Button>
      </div>
    </div>
  );
};

export default Ticket;
