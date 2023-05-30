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
import { ConfessionSpreadsheetMetadata, SelectedObject, SheetTypeKeys } from "types";
import Button from "ui-components/Button";
import { Portal } from "solid-js/web";
import {
  CONFESSION_SHEET_TYPE_METADATA_KEY,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
} from "app-constants";
import initConfessionSpreadsheetMetadata from "methods/initConfessionSpreadsheetMetadata";
import LoadingCircle from "ui-components/LoadingCircle";
import { reconcile } from "solid-js/store";
import localforage from "localforage";
import MainTitle from "ui-components/MainTitle";
import Modal from "ui-components/Modal";
import refreshSpreadsheet from "methods/refreshSpreadsheet";

const selectElementsPayload: {
  title: string;
  key: SheetTypeKeys;
}[] = [
  {
    title: "Chọn trang tính nhận phản hồi Confession (liên kết với biểu mẫu)",
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
              visibility: "PROJECT",
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

                  visibility: "PROJECT",
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
                visibility: "PROJECT",
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
      await refreshSpreadsheet();
    } catch (err) {
      console.error(err);
    }
    setProcessing(false);
  };

  /// TODO: OPTIMIZE THIS
  const handleGoBack = async () => {
    await localforage.removeItem(LOCAL_KEY_CONFESSION_SPREADSHEET_ID);
    setConfessionSpreadsheet(reconcile({}));
  };

  return (
    <div>
      <MainTitle>Định nghĩa các trang tính</MainTitle>
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
      <Modal
        title="Tạo trang tính mới"
        isShow={!!isCreateSheetModalOpen()}
        handleClose={() => setCreateSheetModalOpen(false)}
        handleSubmit={handleCreateNewSheet}
      >
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
      </Modal>
    </div>
  );
};

export default SelectSheets;
