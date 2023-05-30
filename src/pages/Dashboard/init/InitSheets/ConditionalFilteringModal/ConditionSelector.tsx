import {
  Component,
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import {
  CellColor,
  CellTextFormat,
  ConditionMetadata,
  ConfessionSpreadsheetGridData,
  FilteredSheetMetadata,
} from "types";
import { useSpreadsheetData } from "..";

const plusSvgPathDraw =
  "M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 11 L 7 11 L 7 13 L 11 13 L 11 17 L 13 17 L 13 13 L 17 13 L 17 11 L 13 11 L 13 7 L 11 7 z";

const BoldSvg: Component = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
    <path d="M0 64C0 46.3 14.3 32 32 32H80 96 224c70.7 0 128 57.3 128 128c0 31.3-11.3 60.1-30 82.3c37.1 22.4 62 63.1 62 109.7c0 70.7-57.3 128-128 128H96 80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V256 96H32C14.3 96 0 81.7 0 64zM224 224c35.3 0 64-28.7 64-64s-28.7-64-64-64H112V224H224zM112 288V416H256c35.3 0 64-28.7 64-64s-28.7-64-64-64H224 112z" />
  </svg>
);

const ConditionSelector: Component<{
  conditionMetadata: ConditionMetadata;
  sheetKey: FilteredSheetMetadata["key"];
}> = (props) => {
  const [isSelectionDropdownShow, setSelectionDropdownShow] =
    createSignal(false);

  const confessionSpreadsheetGridData =
    useSpreadsheetData() as ConfessionSpreadsheetGridData;

  const selected = confessionSpreadsheetGridData.selected[props.sheetKey];

  const selectionList =
    confessionSpreadsheetGridData![props.conditionMetadata.key];

  const unselectedList = createMemo(() =>
    // @ts-ignore
    (selectionList as CellColor[] | CellTextFormat[]).filter(
      (colorOrFormat: any) =>
        selected[props.conditionMetadata.key].findIndex(
          (selected) => selected.rowIndex === colorOrFormat.rowIndex
        ) === -1
    )
  );

  const handleToggleSelector = () => {
    setSelectionDropdownShow((prev) => !prev);
  };

  return (
    <div class="mt-6 flex justify-between">
      <h5 class="my-auto">{props.conditionMetadata.title}</h5>
      <div class="flex">
        <div class="relative">
          <Show when={unselectedList().length > 0}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              class="hover:cursor-pointer hover:-translate-y-0.5 transition-all"
              onClick={handleToggleSelector}
            >
              <path d={plusSvgPathDraw} />
            </svg>
          </Show>
          <Show when={isSelectionDropdownShow()}>
            <ul class="absolute z-10 py-2 flex w-max left-auto right-0 bg-gray-100 rounded-lg shadow-md">
              <For each={unselectedList()}>
                {(colorOrFormat) => {
                  if ((colorOrFormat as CellColor).color) {
                    const color = (colorOrFormat as CellColor).color;
                    return (
                      <div
                        class={`cursor-pointer block rounded w-6 h-6 mx-1 border-gray-500 border-solid border-2 transition-all hover:-translate-y-0.5`}
                        style={{ "background-color": color.hex }}
                        onClick={() => {
                          (
                            selected[props.conditionMetadata.key] as CellColor[]
                          ).push(colorOrFormat);
                          handleToggleSelector();
                        }}
                      ></div>
                    );
                  }
                  const format = (colorOrFormat as CellTextFormat).format;

                  if (format.bold) return <b class="text-xl">B</b>;
                  if (format.italic) return <i class="text-xl">I</i>;
                  if (format.underline) return <p class="underline text-xl">U</p>;
                  if (format.strikethrough) return <p class="line-through text-xl">S</p>;
                }}
              </For>
            </ul>
          </Show>
        </div>
        <For each={selected[props.conditionMetadata.key]}>
          {(colorOrFormat) => {
            if ((colorOrFormat as CellColor).color) {
              const color = (colorOrFormat as CellColor).color;
              return (
                <div
                  class={`block rounded w-6 h-6 mx-1 border-gray-500 border-solid border-2`}
                  style={{ "background-color": color.hex }}
                ></div>
              );
            }
            const format = (colorOrFormat as CellTextFormat).format;

            return <BoldSvg />;
          }}
        </For>
      </div>
    </div>
  );
};

export default ConditionSelector;
