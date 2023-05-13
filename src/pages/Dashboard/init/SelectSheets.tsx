import {
  Component,
  For,
  createSignal,
  Show,
  batch,
  onMount,
  createMemo,
} from "solid-js";
import { confessionSpreadsheet, setConfessionSpreadsheet } from "store/index";
import { ConfessionSpreadsheetMetadata } from "types";
import Button from "ui-components/Button";
import { Portal } from "solid-js/web";
import {
  CONFESSION_SHEET_TYPE_METADATA_KEY,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
} from "app-constants";
import initConfessionSpreadsheetMetadata from "methods/initConfessionSpreadsheetMetadata";
import LoadingCircle from "ui-components/LoadingCircle";
import { reconcile } from "solid-js/store";

const selectElementsPayload: {
  title: string;
  key: SheetTypeKeys;
}[] = [
  {
    title: "Chọn trang tính nhận phản hồi Confession",
    key: "pendingSheet",
  },
  {
    title: "Chọn trang tính chứa các confession đã duyệt",
    key: "acceptedSheet",
  },
  {
    title: "Chọn trang tính chứa các confession đã từ chối",
    key: "declinedSheet",
  },
  {
    title: "Chọn trang tính chứa các confession đã đăng",
    key: "postedSheet",
  },
];

const numberOfSelected = (selected: Record<any, any>) =>
  Object.values(selected).reduce(
    ///@ts-ignore
    (prev, cur) => (cur !== null ? prev + 1 : prev),
    0
  );

type SheetTypeKeys = keyof Omit<ConfessionSpreadsheetMetadata, "inited">;
type SelectedObject = Record<SheetTypeKeys, number | null>;

const initExistedMetadataSheets = (sheets: gapi.client.sheets.Sheet[]) => {
  const preProcessObject: Record<string, any> = {};
  sheets.forEach((sheet, index) => {
    const metadata = sheet.developerMetadata?.find(
      (metadata) => metadata.metadataKey === CONFESSION_SHEET_TYPE_METADATA_KEY
    );
    if (!!metadata) preProcessObject[metadata.metadataValue!] = index;
  });
  const selectedObject: SelectedObject = {
    acceptedSheet: preProcessObject.acceptedSheet ?? null,
    declinedSheet: preProcessObject.declinedSheet ?? null,
    postedSheet: preProcessObject.postedSheet ?? null,
    pendingSheet: preProcessObject.pendingSheet ?? null,
  };
  return selectedObject;
};

const SelectSheets: Component = () => {
  const [sheets, setSheets] = createSignal(confessionSpreadsheet!.sheets || []);
  const existedMetadataSheets = initExistedMetadataSheets(
    confessionSpreadsheet!.sheets || []
  );
  const [selected, setSelected] = createSignal<SelectedObject>(
    existedMetadataSheets
  );
  const [isEmpty, setEmpty] = createSignal(false);
  const [isCreateSheetModalOpen, setCreateSheetModalOpen] = createSignal<
    string | boolean
  >(false);
  const [isProcessing, setProcessing] = createSignal(false);
  ///@ts-ignore
  let sheetTitleInputRef: HTMLInputElement;

  onMount(() => {
    handleEmpty();
  });

  const handleEmpty = () => {
    if (numberOfSelected(selected()) === sheets().length) {
      setEmpty(true);
    } else {
      setEmpty(false);
    }
  };

  const handleChange = (index: number, key: SheetTypeKeys) => {
    setSelected((prev) => {
      for (const metaKey in prev) {
        /// @ts-ignore
        if (prev[metaKey] === index) {
          /// @ts-ignore
          prev[metaKey] = null;
          break;
        }
      }
      return { ...prev, [key]: index };
    });
    handleEmpty();
    console.log(selected());
  };

  const handleCreateNewSheet = () => {
    const key = isCreateSheetModalOpen();
    const title = sheetTitleInputRef.value;
    if (!title) return;
    if (sheets().some((sheet) => sheet.properties?.title === title))
      return alert(
        "Đã tồn tại trang tính có cùng tiêu đề! Vui lòng đặt tiêu đề khác."
      );

    batch(() => {
      setSheets((prev) => [...prev, { properties: { title } }]);
      setCreateSheetModalOpen(false);
    });
    if (typeof key === "string")
      return handleChange(sheets().length - 1, key as SheetTypeKeys);
    handleEmpty();
  };

  const handleSubmit = async () => {
    setProcessing(true);
    const currentSheetsState = sheets();
    const currentSelectedState = selected();

    const newSheets = Object.values(currentSelectedState).filter(
      (sheetIndex) => !currentSheetsState[sheetIndex!].properties!.sheetId
    );
    if (newSheets.length > 0) {
      try {
        const batchUpdateResult = (
          await gapi.client.sheets.spreadsheets.batchUpdate(
            { spreadsheetId: confessionSpreadsheet!.spreadsheetId! },
            {
              includeSpreadsheetInResponse: false,
              requests: [
                ...newSheets.map((sheetIndex) => ({
                  addSheet: {
                    properties: {
                      title: currentSheetsState[sheetIndex!].properties!.title!,
                    },
                  },
                })),
              ],
            }
          )
        ).result;
        console.log(batchUpdateResult);
        batchUpdateResult!.replies?.forEach((reply, index) => {
          currentSheetsState[newSheets[index]!] = reply!.addSheet!;
        });
      } catch (err) {
        console.error(err);
      }
    }
    try {
      const sheetsNeedUpdateMetadata: {
        sheetId: number;
        sheetTypeValue: string;
      }[] = [];
      const sheetsNeedRemoveMetadata: typeof sheetsNeedUpdateMetadata = [];
      const sheetsNeedCreateMetadata: typeof sheetsNeedUpdateMetadata = [];

      const selectedValues = Object.values(currentSelectedState);
      for (const [sheetTypeValue, index] of Object.entries(
        existedMetadataSheets
      )) {
        // If not selected but existed metadata then delete
        if (index === null || selectedValues.includes(index)) continue;
        sheetsNeedRemoveMetadata.push({
          sheetId: currentSheetsState[index].properties!.sheetId!,
          sheetTypeValue: sheetTypeValue,
        });
      }

      for (const entry of Object.entries(currentSelectedState)) {
        const sheet = currentSheetsState[entry[1]!];
        const sheetForBatchObject = {
          sheetId: sheet.properties!.sheetId!,
          sheetTypeValue: entry[0],
        };
        if (
          // not have metadataKey = type defined key?
          !sheet.developerMetadata ||
          sheet.developerMetadata.some(
            (metadata) =>
              metadata.metadataKey === CONFESSION_SHEET_TYPE_METADATA_KEY
          ) === false
        )
          sheetsNeedCreateMetadata.push(sheetForBatchObject);
        else if (
          // is metadata not as same as pending change?
          sheet.developerMetadata.some(
            (metadata) => metadata.metadataValue === entry[0]
          ) === false
        )
          sheetsNeedUpdateMetadata.push(sheetForBatchObject);
      }
      const batchRequests: gapi.client.sheets.Request[] = [];
      sheetsNeedCreateMetadata.forEach(({ sheetId, sheetTypeValue }) => {
        batchRequests.push({
          createDeveloperMetadata: {
            developerMetadata: {
              location: {
                sheetId,
              },
              metadataKey: CONFESSION_SHEET_TYPE_METADATA_KEY,
              metadataValue: sheetTypeValue,
              visibility: "DOCUMENT",
            },
          },
        });
      });
      sheetsNeedUpdateMetadata.forEach(({ sheetId, sheetTypeValue }) => {
        batchRequests.push({
          updateDeveloperMetadata: {
            dataFilters: [
              {
                developerMetadataLookup: {
                  locationType: "SHEET",
                  metadataKey: CONFESSION_SHEET_TYPE_METADATA_KEY,
                  metadataLocation: {
                    sheetId,
                  },

                  visibility: "DOCUMENT",
                },
              },
            ],
            developerMetadata: {
              metadataValue: sheetTypeValue,
            },
            fields: "metadataValue",
          },
        });
      });
      sheetsNeedRemoveMetadata.forEach(({ sheetId, sheetTypeValue }) => {
        batchRequests.push({
          deleteDeveloperMetadata: {
            dataFilter: {
              developerMetadataLookup: {
                locationType: "SHEET",
                metadataKey: CONFESSION_SHEET_TYPE_METADATA_KEY,
                metadataLocation: {
                  sheetId,
                },
                metadataValue: sheetTypeValue,
                visibility: "DOCUMENT",
              },
            },
          },
        });
      });
      console.log(batchRequests);

      // console.log(
      await gapi.client.sheets.spreadsheets.batchUpdate(
        {
          spreadsheetId: confessionSpreadsheet!.spreadsheetId!,
        },
        {
          includeSpreadsheetInResponse: false,
          requests: batchRequests,
        }
      );
      // );
      setConfessionSpreadsheet(
        (
          await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: confessionSpreadsheet!.spreadsheetId!,
          })
        ).result
      );
      initConfessionSpreadsheetMetadata();
    } catch (err) {
      console.error(err);
    }
    setProcessing(false);
  };

  /// TODO: OPTIMIZE THIS
  const handleGoBack = () => {
    localStorage.removeItem(LOCAL_KEY_CONFESSION_SPREADSHEET_ID);
    setConfessionSpreadsheet(reconcile({}));
  };

  return (
    <div>
      <For each={selectElementsPayload}>
        {(payload) => (
          <div class="max-w-2xl mx-auto mt-10">
            <div class="flex justify-between">
              <h3 class="mr-3 w-full flex flex-col justify-center">
                {payload.title}
              </h3>
              <Show
                when={selected()[payload.key] === null && isEmpty()}
                fallback={
                  <select
                    class="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    onChange={(change) => {
                      handleChange(+change.target.value, payload.key);
                    }}
                    value={`${selected()[payload.key]}`}
                  >
                    <option value="" hidden>
                      Chọn trang tính
                    </option>
                    <For each={sheets()}>
                      {(sheet, index) => (
                        <option value={index()}>
                          {sheet.properties?.title}
                        </option>
                      )}
                    </For>
                  </select>
                }
              >
                <Button
                  class="whitespace-nowrap"
                  onClick={() => setCreateSheetModalOpen(payload.key)}
                >
                  Tạo trang tính
                </Button>
              </Show>
            </div>
          </div>
        )}
      </For>
      <div class="flex justify-center w-full mt-10">
        <Button
          class="mr-3 bg-slate-500 hover:bg-slate-600"
          onClick={handleGoBack}
        >
          Quay lại
        </Button>
        <Button
          class="whitespace-nowrap"
          onClick={() => {
            setCreateSheetModalOpen((prev) => !prev);
          }}
        >
          Tạo trang tính
        </Button>
        <Button
          disabled={
            numberOfSelected(selected()) !== Object.keys(selected()).length ||
            isProcessing()
          }
          onClick={handleSubmit}
        >
          <div class="flex">
            <span>{"Xác nhận "}</span>
            <Show when={isProcessing()}>
              <LoadingCircle />
            </Show>
          </div>
        </Button>
      </div>
      <Show when={isCreateSheetModalOpen()}>
        <Portal>
          <div
            class="relative z-10"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div class="fixed inset-0 z-10 overflow-y-auto">
              <div class="flex flex-col h-full justify-center p-4 text-center sm:items-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div class="flex flex-col">
                      <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3
                          class="text-xl font-semibold leading-6 text-gray-900"
                          id="modal-title"
                        >
                          Tạo trang tính mới
                        </h3>
                        <div class="mt-2">
                          <label
                            for="title-input"
                            class="block mb-2 text-sm font-medium text-gray-900"
                          >
                            Tiêu đề trang tính
                          </label>
                          <input
                            type="text"
                            id="title-input"
                            class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500"
                            ref={sheetTitleInputRef!}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={handleCreateNewSheet}
                    >
                      Tạo
                    </button>
                    <button
                      type="button"
                      class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setCreateSheetModalOpen(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
};

export default SelectSheets;
