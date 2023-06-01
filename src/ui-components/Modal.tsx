import { ParentComponent, Show } from "solid-js";
import { Portal } from "solid-js/web";
import Button from "./Button";
import { twMerge } from "tailwind-merge";

const Modal: ParentComponent<{
  title: string;
  isShow?: boolean;
  handleSubmit?: () => any;
  handleClose?: () => any;
  loading?: boolean;
}> = (props) => {
  return (
    <Show when={props.isShow}>
      <Portal>
        <div
          class={"relative z-10 overflow-hidden block"}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex flex-col h-full justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="flex flex-col">
                    <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3
                        class="text-xl font-semibold leading-6 text-gray-900"
                        id="modal-title"
                      >
                        {props.title}
                      </h3>
                      <div class="my-4 overflow-y-auto lg:max-h-[70vh] max-h-[62vh]">
                        {props.children}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <Button
                    class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={props.handleSubmit}
                    disabled={props.loading}
                  >
                    Xác nhận
                  </Button>
                  <Button
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:bg-gray-200 disabled:text-white disabled:hover:bg-gray-200"
                    onClick={props.handleClose}
                    disabled={props.loading}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default Modal;
