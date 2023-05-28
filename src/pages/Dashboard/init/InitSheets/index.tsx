import { Component, For, createSignal, JSXElement, Show } from "solid-js";
import MainTitle from "ui-components/MainTitle";
import FreshStartModal from "./FreshStartModal";
import ConditionalFilteringModal from "./ConditionalFilteringModal";
import { Portal } from "solid-js/web";
import { createStore, produce } from "solid-js/store";
import Modal from "ui-components/Modal";

type InitOptionsMetadatas = {
  title: string;
  description: string;
  modal: typeof FreshStartModal | typeof ConditionalFilteringModal;
}[];

const InitSheets: Component = () => {
  const initOptionsMetadatas: InitOptionsMetadatas = [
    {
      title: "🚀 Bắt đầu như mới",
      description: `Tất cả những câu trả lời confession trước đó ở bảng tính sẽ được sao chép sang một trang tính mới để lưu trữ. Các confession sau này sẽ được lưu trữ lần lượt ở các trang tính mà bạn đã định nghĩa.`,
      modal: FreshStartModal,
    },
    {
      title: "💻 Lọc có điều kiện",
      description:
        "Tự động sao chép các câu trả lời confession trước đó sang các trang tính được định nghĩa, dựa trên các điều kiện bạn đưa ra như định dạng, màu nền,... của các hàng trong trang tính chứa câu trả lời ban đầu.",
      modal: ConditionalFilteringModal,
    },
  ];

  const [modalShows, setModalShows] = createStore<boolean[]>(
    new Array(initOptionsMetadatas.length).fill(false)
  );

  const handleToggleModal = (index: number) => {
    setModalShows(
      produce((modalShows) => {
        modalShows[index] = !modalShows[index];
      })
    );
    // console.log(modalShows[index])
  };

  return (
    <>
      <div class="text-center">
        <MainTitle>Cấu trúc hóa bảng tính</MainTitle>
        <p class="mx-4">
          Trước khi bắt đầu, bạn cần cấu trúc bảng tính sao cho ứng dụng có thể
          hiểu và quản lí các confession sẵn có cũng như sau này.
          <br />
          Hãy chọn một trong những cách khởi tạo sau:
        </p>
        <div class="flex flex-col my-10 mx-4 justify-center md:flex-row">
          {initOptionsMetadatas.map((option, index) => {
            const toggler = () => handleToggleModal(index);
            return (
              <>
                <button
                  class="block max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 md:mx-2 my-2"
                  onClick={toggler}
                >
                  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                    {option.title}
                  </h5>
                  <p class="font-normal text-gray-700">{option.description}</p>
                </button>
                <option.modal
                  title={option.title}
                  isShow={modalShows[index]}
                  handleClose={toggler}
                />
              </>
            );
          })}
        </div>
        <p>
          <b>* Lưu ý: </b>
          Trang tính được định nghĩa là các trang tính: trang tính chứa câu trả
          lời, trang tính "đã duyệt", trang tính "đã đăng", trang tính "đã từ
          chối"
        </p>
      </div>
    </>
  );
};

export default InitSheets;
