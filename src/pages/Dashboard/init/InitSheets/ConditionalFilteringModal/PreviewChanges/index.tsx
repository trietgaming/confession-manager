import {
  Component,
  For,
  ParentComponent,
  Show,
  batch,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js";
import { createMutable } from "solid-js/store";
import { Portal } from "solid-js/web";
import { confessionMetadata, confessionSpreadsheet } from "store/index";
import { twMerge } from "tailwind-merge";
import {
  ConfessionSpreadsheetGridData,
  ConfessionSpreadsheetMetadata,
  PreviewSheetKeys,
} from "types";
import Button from "ui-components/Button";
import TableComponent from "./TableComponent";
import { useSpreadsheetData } from "../..";
import setConfessionInited from "methods/setConfessionInited";
import { SHEETS_INITED_TYPES } from "app-constants";
import refreshSpreadsheet from "methods/refreshSpreadsheet";

export const MAX_CELL_HEIGHT = 20;
export const MAX_CELL_WIDTH = 225;
export const INDEX_WIDTH = 40;

const PreviewChanges: Component<{
  show: boolean;
  handleClose: () => any;
  sheetValues: { [key in PreviewSheetKeys]: string[][] } | null;
}> = (props) => {
  const sheetKeys: PreviewSheetKeys[] = [
    "pendingSheet",
    "acceptedSheet",
    "declinedSheet",
    "postedSheet",
  ];
  const [currentSheetKey, setcurrentSheetKey] = createSignal(sheetKeys[0]);
  const [tableScrollY, setTableScrollY] = createSignal(0);
  const [tableScrollX, setTableScrollX] = createSignal(0);
  const [isSubmitting, setSubmitting] = createSignal(false);
  const confessionSpreadsheetGridData = useSpreadsheetData();
  let tableContainer: HTMLDivElement | undefined;

  createEffect(() => {
    if (!props.sheetValues || !tableContainer) return;
    const listener = () => {
      batch(() => {
        setTableScrollY(tableContainer!.scrollTop);
        setTableScrollX(tableContainer!.scrollLeft);
      });
    };
    tableContainer.addEventListener("scroll", listener);
    return () => tableContainer!.removeEventListener("scroll", listener);
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    const gridData =
      confessionSpreadsheetGridData as ConfessionSpreadsheetGridData;
    const batchRequests: gapi.client.sheets.Request[] = [];
    const valueBatchUpdateRequest: gapi.client.sheets.BatchUpdateValuesRequest =
      { includeValuesInResponse: false, data: [], valueInputOption: "RAW" };

    batchRequests.push({
      deleteDimension: {
        range: {
          dimension: "ROWS",
          sheetId: confessionMetadata.pendingSheet?.properties?.sheetId!,
          startIndex: 1,
          endIndex: gridData.rowData.length! - 1,
        },
      },
    });
    for (const sheetKey of sheetKeys) {
      const data = props.sheetValues![sheetKey];
      if (data.length === 0) continue;
      const sheetId = confessionMetadata[sheetKey]?.properties?.sheetId!;
      const sheetTitle = confessionMetadata[sheetKey]?.properties?.title!;
      batchRequests.push({
        insertDimension: {
          range: {
            dimension: "ROWS",
            sheetId: sheetId,
            startIndex: 1,
            endIndex: data.length - 1,
          },
        },
      });
      valueBatchUpdateRequest.data!.push({
        majorDimension: "ROWS",
        range: `${sheetTitle}!A1:B${data.length}`,
        values: data,
      });
    }

    // TODO: FIX DELETE FORM ROWS

    try {
      const spreadsheetId = confessionSpreadsheet.spreadsheetId!;
      await gapi.client.sheets.spreadsheets.batchUpdate(
        {
          spreadsheetId,
        },
        {
          includeSpreadsheetInResponse: false,
          requests: batchRequests,
        }
      );
      await gapi.client.sheets.spreadsheets.values.batchUpdate(
        {
          spreadsheetId,
        },
        valueBatchUpdateRequest
      );
      await refreshSpreadsheet(
        await setConfessionInited(SHEETS_INITED_TYPES.FILTERED)
      );
    } catch (err) {
      console.error(err);
    }

    setSubmitting(false);
  };

  return (
    <Show when={props.show}>
      <Portal>
        <div
          class={"relative z-10 overflow-hidden block"}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
          <div class="fixed inset-0 z-10 overflow-y-auto w-full">
            <div class="flex flex-col h-full justify-center text-center sm:items-center sm:p-0 w-full">
              <div class="w-full h-full relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full">
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 h-full">
                  <div class="flex flex-col h-full justify-between">
                    <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3
                        class="text-xl font-semibold leading-6 text-gray-900"
                        id="modal-title"
                      >
                        Xem trước các thay đổi
                      </h3>
                      <div
                        class="my-4 overflow-auto max-h-[81vh] max-w-full whitespace-nowrap"
                        ref={tableContainer}
                      >
                        <div
                          style={{
                            height: props.sheetValues
                              ? `${
                                  MAX_CELL_HEIGHT *
                                    props.sheetValues[currentSheetKey()]
                                      .length +
                                  50
                                }px`
                              : "auto",
                            width: props.sheetValues
                              ? `${
                                  MAX_CELL_WIDTH *
                                    (confessionMetadata[currentSheetKey()]
                                      ?.properties?.gridProperties
                                      ?.columnCount || 0) +
                                  50
                                }px`
                              : "auto",
                          }}
                          class="overflow-auto relative"
                        >
                          <TableComponent
                            sheetKey={currentSheetKey()}
                            sheetValues={props.sheetValues}
                            scrollY={tableScrollY()}
                            scrollX={tableScrollX()}
                            outerContainer={tableContainer!}
                          />
                        </div>
                      </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:flex w-full justify-between absolute bottom-0">
                      <div>
                        {sheetKeys.map((sheetKey) => {
                          return (
                            <button
                              class={twMerge(
                                "hover:bg-slate-200 bg-white text-sm h-full px-2 border",
                                currentSheetKey() === sheetKey
                                  ? "text-sky-500"
                                  : ""
                              )}
                              onClick={() => setcurrentSheetKey(sheetKey)}
                            >
                              {
                                (
                                  confessionMetadata[
                                    sheetKey as keyof ConfessionSpreadsheetMetadata
                                  ] as gapi.client.sheets.Sheet
                                ).properties!.title
                              }
                            </button>
                          );
                        })}
                      </div>
                      <div class="sm:flex-row-reverse flex sm:px-6">
                        <Button
                          class="my-0 inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-2 sm:w-auto"
                          onClick={handleSubmit}
                          disabled={
                            isSubmitting() || props.sheetValues === null
                          }
                        >
                          Xác nhận
                        </Button>
                        <Button
                          class="my-0 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:bg-gray-200 disabled:text-white disabled:hover:bg-gray-200"
                          onClick={props.handleClose}
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
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default PreviewChanges;
