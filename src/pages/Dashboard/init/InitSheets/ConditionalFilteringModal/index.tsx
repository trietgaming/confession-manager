import {
  Component,
  For,
  Show,
  batch,
  createMemo,
  createSignal,
} from "solid-js";
import Button from "ui-components/Button";
import Modal from "ui-components/Modal";
import {
  CellColor,
  CellTextFormat,
  ConfessionSpreadsheetGridData,
  FilteredSheetMetadata,
  PreviewSheetKeys,
} from "types";
import DownArrowSvg from "ui-components/DownArrowSvg";
import AddFilteringCondition from "./AddFilteringCondition";
import { useSpreadsheetData } from "..";
import CenteredLoadingCircle from "ui-components/CenteredLoadingCircle";
import createSignalObjectEmptyChecker from "methods/createSignalObjectEmptyChecker";
import { Conditions } from "types";
import { confessionMetadata } from "store/index";
import hashTextFormat from "methods/hashTextFormat";
import { key } from "localforage";
import getColorFromCell from "methods/getColorFromCell";
import PreviewChanges from "./PreviewChanges";

const addFilteredSheetMetadata: FilteredSheetMetadata[] = [
  {
    key: "postedSheet",
    title: "Trang tính Đã đăng",
  },
  {
    key: "declinedSheet",
    title: "Trang tính Đã từ chối",
  },
  {
    key: "acceptedSheet",
    title: "Trang tính Đã duyệt (chưa đăng)",
  },
];

const ConditionalFilteringModal: Component<{
  title: string;
  isShow?: boolean;
  handleClose?: () => any;
}> = (props) => {
  const [isAddFilteredSheetDropdownShow, setAddFilteredSheetDropdownShow] =
    createSignal(false);
  const [isPreviewModalShow, setPreviewModalShow] = createSignal(false);
  const [isProcessing, setProcessing] = createSignal(false);
  const [sheetValues, setSheetValues] = createSignal<
    | {
        [key in PreviewSheetKeys]: string[][];
      }
    | null
  >(null);

  const [selectedSheets, setSelectedSheets] = createSignal<
    FilteredSheetMetadata[]
  >([]);
  const confessionSpreadsheetGridData = useSpreadsheetData();

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
  const isDataEmpty = createSignalObjectEmptyChecker(
    confessionSpreadsheetGridData
  );

  // TODO: handle submit
  const handleSubmit = () => {
    setProcessing(true);
    console.log(confessionSpreadsheetGridData);
    const gridData =
      confessionSpreadsheetGridData as ConfessionSpreadsheetGridData;
    const sheetKeys = Object.keys(
      gridData.selected
    ) as (keyof ConfessionSpreadsheetGridData["selected"])[];

    const batchRequests: gapi.client.sheets.BatchUpdateSpreadsheetRequest["requests"] =
      [];

    const styleMap: {
      [key in keyof ConfessionSpreadsheetGridData["selected"]]: {
        [key in keyof Conditions]: {
          [key: string]: true | "";
        };
      };
    } = {
      acceptedSheet: {
        backgroundColor: {},
        foregroundColor: {},
        textFormat: {},
      },
      declinedSheet: {
        backgroundColor: {},
        foregroundColor: {},
        textFormat: {},
      },
      postedSheet: {
        backgroundColor: {},
        foregroundColor: {},
        textFormat: {},
      },
    };

    const sheetValues: {
      [key in PreviewSheetKeys]: string[][];
    } = {
      pendingSheet: [
        gridData.rowData[0]!.values!.map(
          (cell) => cell.formattedValue as string
        )!,
      ],
      acceptedSheet: [],
      declinedSheet: [],
      postedSheet: [],
    };

    for (const sheetKey of sheetKeys) {
      const selected = gridData.selected[sheetKey];
      (
        ["backgroundColor", "foregroundColor"] as (keyof Omit<
          Conditions,
          "textFormat"
        >)[]
      ).forEach((colorKey) => {
        for (let i = 0, n = selected[colorKey].length; i < n; ++i) {
          const color = selected[colorKey][i] as CellColor;
          styleMap[sheetKey][colorKey]![color.color.hex] = true;
        }
      });
      for (const textFormat of selected["textFormat"]) {
        styleMap[sheetKey]["textFormat"]![hashTextFormat(textFormat.format)] =
          true;
      }
    }

    console.log(styleMap);
    console.log(gridData.rowData[1]);

    for (let i = 1, n = gridData.rowData.length; i < n; ++i) {
      const rowData = gridData.rowData[i];
      if (!rowData.values) continue;
      const pushSheets: {
        [key in FilteredSheetMetadata["key"]]?: true;
      } = {};
      for (const cell of rowData.values) {
        if (!cell.formattedValue) continue;
        const bgColor = getColorFromCell(
          cell.effectiveFormat?.backgroundColorStyle!,
          confessionSpreadsheetGridData.themeMap
        );
        const { foregroundColorStyle, ...cellTextFormat } =
          cell.effectiveFormat?.textFormat!;
        const fgColor = getColorFromCell(
          foregroundColorStyle!,
          confessionSpreadsheetGridData.themeMap
        );
        const textFormats = hashTextFormat(
          cellTextFormat as CellTextFormat["format"]
        );
        for (const sheetKey of sheetKeys) {
          if (
            styleMap[sheetKey].backgroundColor![bgColor.hex] ||
            styleMap[sheetKey].foregroundColor![fgColor.hex] ||
            styleMap[sheetKey].textFormat![textFormats]
          ) {
            pushSheets[sheetKey] = true;
          }
        }
      }
      const rowValues = rowData.values.map(
        (cell) => cell.formattedValue || void 0
      );
      let pushAny = false;
      for (const sheetKey in pushSheets) {
        pushAny = true;
        sheetValues[sheetKey as FilteredSheetMetadata["key"]].push(
          rowValues as string[]
        );
      }
      if (!pushAny) sheetValues["pendingSheet"].push(rowValues as string[]);
    }
    console.log(sheetValues);
    batch(() => {
      setPreviewModalShow(true);
      setProcessing(false);
      setSheetValues(sheetValues);
    });
  };

  return (
    <>
      <PreviewChanges
        show={isPreviewModalShow()}
        handleClose={() => setPreviewModalShow(false)}
        sheetValues={sheetValues()}
      />
      <Modal
        title={props.title}
        isShow={props.isShow}
        handleClose={props.handleClose}
        handleSubmit={handleSubmit}
      >
        <Show
          when={!isDataEmpty()}
          fallback={
            <div class="mb-20">
              <CenteredLoadingCircle />
            </div>
          }
        >
          <div class="overflow-y-auto md:py-8">
            <For each={selectedSheets()}>
              {(metadata, index) => (
                <AddFilteringCondition
                  metadata={metadata}
                  handleClose={() => {
                    handleCloseSheet(index());
                    confessionSpreadsheetGridData.selected[metadata.key] = {
                      backgroundColor: [],
                      foregroundColor: [],
                      textFormat: [],
                    };
                  }}
                />
              )}
            </For>
            <Show when={unselectedSheets().length > 0}>
              <div class="flex justify-center w-full">
                <div class="block relative">
                  <Button
                    class="mt-2"
                    onClick={() =>
                      setAddFilteredSheetDropdownShow((prev) => !prev)
                    }
                  >
                    Lọc sang trang tính <DownArrowSvg />
                  </Button>

                  <Show when={isAddFilteredSheetDropdownShow()}>
                    <div class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-60">
                      <ul class="py-2 text-sm text-gray-700">
                        <For each={unselectedSheets()}>
                          {(metadata) => (
                            <li>
                              <a
                                onClick={() => handleSelectSheet(metadata)}
                                class="hover:cursor-pointer block px-4 py-2 hover:bg-gray-100"
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
        </Show>
      </Modal>
    </>
  );
};

export default ConditionalFilteringModal;
