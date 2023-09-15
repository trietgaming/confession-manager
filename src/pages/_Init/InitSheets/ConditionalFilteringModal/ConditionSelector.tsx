import { Component, For, Show, JSX, createMemo, createSignal } from "solid-js";
import {
  CellColor,
  CellTextFormat,
  ConditionMetadata,
  ConfessionSpreadsheetGridData,
  FilteredSheetMetadata,
  TextFormat,
} from "types";
import { useSpreadsheetData } from "..";
import Color from "classes/Color";

export const plusSvgPathDraw =
  "M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 11 L 7 11 L 7 13 L 11 13 L 11 17 L 13 17 L 13 13 L 17 13 L 17 11 L 13 11 L 13 7 L 11 7 z";

const BaseTextStyleComponents: { [key in TextFormat]: Component } = {
  bold: () => <b class="text-l">B</b>,
  italic: () => <i class="text-l font-serif">I</i>,
  underline: () => <p class="underline text-l">U</p>,
  strikethrough: () => <p class="line-through text-l">S</p>,
};

const TextStyleElement: Component<{
  format: CellTextFormat["format"];
  onClick?: () => any;
}> = (props) => {
  let Style = null;

  const trueKeys = Object.keys(props.format).filter(
    (format) => props.format[format as TextFormat] === true
  ) as TextFormat[];
  const onlyOne = trueKeys.length === 1;

  if (onlyOne) Style = BaseTextStyleComponents[trueKeys[0]]({});
  else {
    Style = (
      <div
        class="text-l"
        style={{
          "text-decoration-line": props.format.underline
            ? "underline"
            : props.format.strikethrough
            ? "line-through"
            : "none",
          "font-weight": props.format.bold ? "bold" : "initial",
          "font-style": props.format.italic ? "italic" : "initial",
        }}
      >
        M
      </div>
    );
  }
  return (
    <div
      onClick={props.onClick}
      class="cursor-pointer block rounded w-7 h-7 mx-1 border-2 border-solid border-slate-500 transition-all hover:bg-slate-300 text-center my-auto"
    >
      {Style}
    </div>
  );
};

const ColorElement: Component<{ color: Color; onClick?: () => any }> = (
  props
) => {
  return (
    <div
      class={`cursor-pointer block rounded w-6 h-6 mx-1 border-slate-500 border-solid border-2 transition-all hover:-translate-y-0.5`}
      style={{ "background-color": props.color.hex }}
      onClick={props.onClick}
    ></div>
  );
};

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
            <ul class="absolute z-10 py-2 flex w-max flex-row left-auto right-0 bg-gray-100 rounded-lg shadow-md">
              <For each={unselectedList()}>
                {(colorOrFormat) => {
                  const onClickHandler = () => {
                    (selected[props.conditionMetadata.key] as CellColor[]).push(
                      colorOrFormat as CellColor
                    );
                    handleToggleSelector();
                  };
                  if ((colorOrFormat as CellColor).color) {
                    const color = (colorOrFormat as CellColor).color;
                    return (
                      <ColorElement color={color} onClick={onClickHandler} />
                    );
                  }
                  const format = (colorOrFormat as CellTextFormat).format;

                  return (
                    <TextStyleElement
                      format={format}
                      onClick={onClickHandler}
                    />
                  );
                }}
              </For>
            </ul>
          </Show>
        </div>
        <For each={selected[props.conditionMetadata.key]}>
          {(colorOrFormat) => {
            const onClickHandler = () => {
              (selected[props.conditionMetadata.key] as any[]) = (
                selected[props.conditionMetadata.key] as any[]
              ).filter((val) => val.rowIndex !== colorOrFormat.rowIndex);
            };
            if ((colorOrFormat as CellColor).color) {
              const color = (colorOrFormat as CellColor).color;
              return <ColorElement color={color} onClick={onClickHandler} />;
            }
            const format = (colorOrFormat as CellTextFormat).format;

            return (
              <TextStyleElement format={format} onClick={onClickHandler} />
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default ConditionSelector;
