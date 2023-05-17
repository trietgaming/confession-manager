import { Component } from "solid-js";
import Button from "ui-components/Button";

const NoSpreadsheetLinked: Component<{
  handleReturn: () => any;
  formObj: gapi.client.forms.Form;
}> = ({ handleReturn, formObj }) => {
  return (
    <div class="flex flex-col justify-center h-full">
      <div class="flex px-4 flex-col items-center justify-center">
        <h1 class="text-2xl mb-10 text-center">
          Biểu mẫu <i>{formObj.info?.documentTitle}</i> <br /> chưa liên kết với
          bất kì trang tính nào.
        </h1>
        <p>
          Trước khi bắt đầu, bạn cần liên kết biểu mẫu này với một trang tính để
          ứng dụng có thể lưu trữ và quản lí các confession, hoặc bạn có thể
          chọn một trang tính hay biểu mẫu khác.
        </p>
        <p>
          Để liên kết, nhấn vào nút liên kết ngay bên dưới, sau đó ấn vào nút
          "Liên kết với trang tính" để liên kết
        </p>
        <div class="flex mt-10">
          <Button
            onClick={handleReturn}
            class="hover:bg-gray-50 bg-gray-200 text-black"
          >
            Quay lại
          </Button>
          <a
            href={`https://docs.google.com/forms/d/${formObj.formId}/edit#responses`}
            target="blank"
          >
            <Button>Liên kết ngay</Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NoSpreadsheetLinked;
