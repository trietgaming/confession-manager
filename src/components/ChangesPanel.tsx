import hadChanges from "app-hooks/hadChanges";
import useLoading from "app-hooks/useLoading";
import ConfessionsManager from "controllers/ConfessionsManager";
import Confession from "models/Confession";
import { Component, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { pendingChanges } from "store/index";
import Button from "ui-components/Button";
import LoadingCircle from "ui-components/LoadingCircle";
import { PENDING_CHANGES_CONFESSION_ARRAY_KEYS } from "../constants";

const ChangesPanel: Component = () => {
  const [wrapSubmitting, isSubmitting] = useLoading();

  const handleCancel = () => {
    for (const key of PENDING_CHANGES_CONFESSION_ARRAY_KEYS) {
      for (
        let i = 0, n = (pendingChanges[key]! as Confession[]).length;
        i < n;
        ++i
      ) {
        const cfs = (pendingChanges[key]! as Confession[])[i];
        cfs.setHidden(false);
      }
      pendingChanges[key] = [];
    }
  };
  const handleSaveChanges = wrapSubmitting(async () => {
    // console.log(pendingChanges);
    await ConfessionsManager.savePendingChanges();
  });
  return (
    <Show when={hadChanges()}>
      <Portal>
        <div>
          <div class="fixed inset-0 z-10 overflow-y-auto pointer-events-none">
            <div class="flex flex-col h-full justify-end p-4 text-center sm:items-center sm:p-0">
              <div class="mr-4 w-full self-end transform overflow-hidden rounded-lg text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-lg">
                <div class="pointer-events-auto flex flex-col md:flex-row justify-between bg-white px-4 py-3 sm:px-6">
                  <h3 class="flex flex-col justify-center text-center sm:ml-4 sm:mt-0 sm:text-left text-base font-semibold text-gray-900">
                    Bạn có muốn lưu thay đổi?
                  </h3>
                  <div class="py-2 flex space-x-2">
                    <Button
                      onClick={handleSaveChanges}
                      class="my-0 inline-flex space-x-2 w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      disabled={isSubmitting()}
                    >
                      <p>Lưu</p>
                      <Show when={isSubmitting()}>
                        <LoadingCircle />
                      </Show>
                    </Button>
                    <Button
                      onClick={handleCancel}
                      class="my-0 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      disabled={isSubmitting()}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default ChangesPanel;
