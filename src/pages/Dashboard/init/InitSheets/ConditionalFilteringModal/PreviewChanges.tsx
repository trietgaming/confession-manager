import {
  Component,
  For,
  ParentComponent,
  Show,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { createMutable } from "solid-js/store";
import { Portal } from "solid-js/web";
import {
  confessionMetadata,
  confessionSpreadsheet,
  setConfessionMetadata,
} from "store/index";
import { twMerge } from "tailwind-merge";
import {
  ConfessionSpreadsheetGridData,
  ConfessionSpreadsheetMetadata,
  PreviewSheetKeys,
} from "types";
import Button from "ui-components/Button";
import Modal from "ui-components/Modal";

const baseRowClass = "border min-w-[2em] whitespace-nowrap";

const TableCell: ParentComponent<{
  header?: boolean;
}> = (props) => {
  return props.header ? (
    <th class={baseRowClass}>{props.children}</th>
  ) : (
    <td class={baseRowClass}>{props.children}</td>
  );
};

function columnToLetter(column: number) {
  let temp,
    letter = "";
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

const ColumnIndexes: Component<{
  sheetKey: PreviewSheetKeys;
}> = (props) => {
  const numCol = createMemo(
    () =>
      confessionMetadata[props.sheetKey]?.properties?.gridProperties
        ?.columnCount
  );

  // TODO: This runs too slow, optimze when possible!
  const ths = createMemo(() => {
    const res = [];
    for (let i = 1; i <= numCol()!; ++i) {
      res.push(<TableCell header>{columnToLetter(i)}</TableCell>);
    }
    return res;
  });

  return (
    <tr>
      <TableCell header />
      {ths()}
    </tr>
  );
};

const TableElement: Component<{
  sheetValues: { [key in PreviewSheetKeys]: string[][] } | null;
  sheetKey: PreviewSheetKeys;
}> = (props) => {
  return (
    <table class="border border-collapse h-full">
      {<ColumnIndexes sheetKey={props.sheetKey} />}

      <For each={props.sheetValues ? props.sheetValues[props.sheetKey] : []}>
        {(values, index) => {
          const ValuesElements = values.map((value) => {
            return <TableCell>{value}</TableCell>;
          });
          for (
            let i = 0,
              n =
                confessionMetadata[props.sheetKey]?.properties?.gridProperties
                  ?.columnCount! - values.length;
            i < n;
            ++i
          ) {
            ValuesElements.push(<TableCell />);
          }
          return (
            <tr class="">
              <TableCell>{index()}</TableCell>
              {ValuesElements}
            </tr>
          );
        }}
      </For>
    </table>
  );
};

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
                      <div class="my-4 overflow-y-auto max-h-[81vh] max-w-full">
                        {sheetKeys.map((sheetKey) => (
                          <Show when={currentSheetKey() === sheetKey}>
                            <TableElement
                              sheetKey={sheetKey}
                              sheetValues={props.sheetValues}
                            />
                          </Show>
                        ))}
                      </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:flex w-full justify-between">
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
                          onClick={() => {}}
                          disabled={false}
                        >
                          Xác nhận
                        </Button>
                        <Button
                          class="my-0 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:bg-gray-200 disabled:text-white disabled:hover:bg-gray-200"
                          onClick={props.handleClose}
                          disabled={false}
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