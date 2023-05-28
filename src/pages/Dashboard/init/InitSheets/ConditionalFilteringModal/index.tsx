import { Component, For, Show, createMemo, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import Button from "ui-components/Button";
import Modal from "ui-components/Modal";
import { ConfessionSpreadsheetMetadata } from "types";
import DownArrowSvg from "ui-components/DownArrowSvg";
import AddFilteringCondition from "./AddFilteringCondition";

export type FilteredSheetMetadata = {
  key: keyof Omit<
    ConfessionSpreadsheetMetadata,
    "inited" | "archivedSheet" | "pendingSheet"
  >;
  title: string;
};

const addFilteredSheetMetadata: FilteredSheetMetadata[] = [
  {
    key: "acceptedSheet",
    title: "Trang tính Đã duyệt (chưa đăng)",
  },
  {
    key: "declinedSheet",
    title: "Trang tính Đã từ chối",
  },
  {
    key: "postedSheet",
    title: "Trang tính Đã đăng",
  },
];

const ConditionalFilteringModal: Component<{
  title: string;
  isShow?: boolean;
  handleClose?: () => any;
}> = (props) => {
  const [isAddFilteredSheetDropdownShow, setAddFilteredSheetDropdownShow] =
    createSignal(false);

  const [selectedSheets, setSelectedSheets] = createSignal<
    FilteredSheetMetadata[]
  >([]);

  const unselectedSheets = createMemo(() =>
    addFilteredSheetMetadata.filter(
      (metadata) =>
        selectedSheets().findIndex(
          (selected) => selected.key === metadata.key
        ) === -1
    )
  );

  const handleSelectSheet = (metadataObj: FilteredSheetMetadata) => {
    setSelectedSheets((prev) => [...prev, metadataObj]);
    setAddFilteredSheetDropdownShow(false);
  };

  const handleCloseSheet = (index: number) => {
    setSelectedSheets((prev) => prev.filter((_, i) => i != index));
  };

  return (
    <Modal
      title={props.title}
      isShow={props.isShow}
      handleClose={props.handleClose}
    >
      <div class="overflow-y-auto">
        <For each={selectedSheets()}>
          {(metadata, index) => (
            <AddFilteringCondition
              metadata={metadata}
              handleClose={() => handleCloseSheet(index())}
            />
          )}
        </For>
        <Show when={unselectedSheets().length > 0}>
          <div class="flex justify-center w-full">
            <div class="block relative">
              <Button
                class="mt-2"
                onClick={() => setAddFilteredSheetDropdownShow((prev) => !prev)}
              >
                Lọc sang trang tính <DownArrowSvg />
              </Button>

              <Show when={isAddFilteredSheetDropdownShow()}>
                <div class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-60 dark:bg-gray-700 mb-2">
                  <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
                    <For each={unselectedSheets()}>
                      {(metadata) => (
                        <li>
                          <a
                            onClick={() => handleSelectSheet(metadata)}
                            class="hover:cursor-pointer block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            {metadata.title}
                          </a>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </div>
    </Modal>
  );
};

export default ConditionalFilteringModal;
