import {
  Component,
  For,
  createSignal,
  JSXElement,
  Show,
  createContext,
  useContext,
  onMount,
  Accessor,
  batch,
} from "solid-js";
import MainTitle from "ui-components/MainTitle";
import FreshStartModal from "./FreshStartModal";
import ConditionalFilteringModal from "./ConditionalFilteringModal";
import { createMutable, createStore, produce } from "solid-js/store";
import { confessionMetadata, confessionSpreadsheet } from "store/index";
import {
  CellColor,
  CellTextFormat,
  ConfessionSpreadsheetGridData,
  FilteredSheetMetadata,
  InitOptionsMetadatas,
  RGB,
  TextFormat,
  ThemeMap,
} from "types";
import rgbToHex from "methods/rgbToHex";
import Color from "classes/Color";
import hexToRgb from "methods/hexToRgb";
import getColorFromCell from "methods/getColorFromCell";

function setFrom<T extends unknown[]>(
  arr: T,
  diff: (prev: (typeof arr)[number], cur: (typeof arr)[number]) => boolean
) {
  if (arr.length === 0) return [];
  const result = [arr[0]] as T;
  for (let i = 1, n = arr.length; i < n; ++i) {
    const cur = arr[i];
    const prev = arr[i - 1];
    if (diff(prev, cur)) {
      result.push(cur);
    }
  }
  return result;
}

const SpreadsheetDataContext = createContext<
  ConfessionSpreadsheetGridData | { [key: string]: any }
>({});

const InitSheets: Component = () => {
  const initOptionsMetadatas: InitOptionsMetadatas = [
    {
      title: "🚀 Bắt đầu như mới",
      description: `Tất cả những câu trả lời confession trước đó ở bảng tính sẽ được sao chép sang một trang tính mới để lưu trữ. Các confession sau này sẽ được lưu trữ lần lượt ở các trang tính mà bạn đã định nghĩa.`,
      modal: FreshStartModal,
    },
    {
      title: "💻 Lọc có điều kiện",
      description:
        "Tự động sao chép các câu trả lời confession trước đó sang các trang tính được định nghĩa, dựa trên các điều kiện bạn đưa ra như kiểu chữ, màu chữ, màu nền của các ô trong các hàng thuộc trang tính chứa câu trả lời ban đầu.",
      modal: ConditionalFilteringModal,
    },
  ];

  const [modalShows, setModalShows] = createStore<boolean[]>(
    new Array(initOptionsMetadatas.length).fill(false)
  );

  const spreadsheetGridData = createMutable<
    ConfessionSpreadsheetGridData | { [key: string]: any }
  >({});

  const handleToggleModal = (index: number) => {
    setModalShows(
      produce((modalShows) => {
        modalShows[index] = !modalShows[index];
      })
    );
    // console.log(modalShows[index])
  };

  // TODO: HEAVY TASKS, ALWAYS OPTIMIZE WHEN POSSIBLE!
  onMount(async () => {
    const getResult = (
      await gapi.client.sheets.spreadsheets.getByDataFilter(
        {
          spreadsheetId: confessionSpreadsheet.spreadsheetId!,
          fields:
            "sheets/data/rowData/values(formattedValue,effectiveFormat(backgroundColorStyle,textFormat(bold,italic,underline,strikethrough,foregroundColorStyle)))",
        },
        {
          includeGridData: true,
          dataFilters: [
            {
              gridRange: {
                startRowIndex: 0,
                sheetId: confessionMetadata.pendingSheet?.properties?.sheetId,
              },
            },
          ],
        }
      )
    ).result;
    const rowDatas = (
      (getResult.sheets as gapi.client.sheets.Sheet[])[0]
        .data as gapi.client.sheets.GridData[]
    )[0].rowData as gapi.client.sheets.RowData[];

    // console.log(rowDatas);

    // @ts-ignore
    const themeMap: ThemeMap = {};
    for (const colorPair of confessionSpreadsheet.properties!.spreadsheetTheme!
      .themeColors!) {
      themeMap[colorPair.colorType as string] = new Color(
        colorPair.color!.rgbColor!
      );
    }

    const backgroundColors: CellColor[] = [];
    const foregroundColors: CellColor[] = [];
    const textFormats: CellTextFormat[] = [];

    for (let i = 1, n = rowDatas.length; i < n; ++i) {
      const row = rowDatas[i];
      if (!row.values) continue;
      for (const cell of row.values) {
        if (!cell.formattedValue) continue;

        backgroundColors.push({
          color: getColorFromCell(
            cell.effectiveFormat!.backgroundColorStyle!,
            themeMap
          ),
          rowIndex: i,
        });

        const { foregroundColorStyle, ...textStyles } =
          cell.effectiveFormat?.textFormat!;

        foregroundColors.push({
          color: getColorFromCell(foregroundColorStyle!, themeMap),
          rowIndex: i,
        });

        for (const style of Object.values(textStyles)) {
          if (style === true) {
            // @ts-ignore
            textFormats.push({ format: textStyles, rowIndex: i });
            break;
          }
        }
      }
    }
    const colorCmp = (
      colorA: (typeof backgroundColors)[number],
      colorB: (typeof backgroundColors)[number]
    ) => {
      if (colorA.color.hex < colorB.color.hex) return -1;
      if (colorA.color.hex > colorB.color.hex) return 1;
      return 0;
    };
    backgroundColors.sort(colorCmp);
    foregroundColors.sort(colorCmp);
    textFormats.sort((a, b) => {
      if (a.format.bold === b.format.bold) {
        if (a.format.italic === b.format.italic) {
          if (a.format.strikethrough === b.format.strikethrough) {
            if (a.format.underline === b.format.underline) return 0;
            if (a.format.underline < b.format.underline) return -1;
            return 1;
          }
          if (a.format.strikethrough < b.format.strikethrough) return -1;
          return 1;
        }
        if (a.format.italic < b.format.italic) return -1;
        return 1;
      }
      if (a.format.bold < b.format.bold) return -1;
      return 1;
    });

    const backgroundColorSet = setFrom(
        backgroundColors,
        (prevColor, curColor) => prevColor.color.hex !== curColor.color.hex
      ),
      foregroundColorSet = setFrom(
        foregroundColors,
        (prevColor, curColor) => prevColor.color.hex !== curColor.color.hex
      ),
      textFormatSet: typeof textFormats = setFrom(
        textFormats,
        (prevFormat, curFormat) =>
          prevFormat.format.bold !== curFormat.format.bold ||
          prevFormat.format.italic !== curFormat.format.italic ||
          prevFormat.format.strikethrough !== curFormat.format.strikethrough ||
          prevFormat.format.underline !== curFormat.format.underline
      );
    // console.log(backgroundColors);
    // console.log(backgroundColorSet);
    // console.log(foregroundColorSet);
    // console.log(textFormatSet);

    batch(() => {
      const gridData = spreadsheetGridData as ConfessionSpreadsheetGridData;
      gridData.rowData = rowDatas;
      gridData.backgroundColor = backgroundColorSet;
      gridData.foregroundColor = foregroundColorSet;
      gridData.textFormat = textFormatSet;
      /// @ts-ignore
      gridData.selected = {};
      (
        [
          "acceptedSheet",
          "declinedSheet",
          "postedSheet",
        ] as FilteredSheetMetadata["key"][]
      ).forEach((key) => {
        gridData.selected[key] = {
          backgroundColor: [],
          foregroundColor: [],
          textFormat: [],
        };
      });
      gridData.themeMap = themeMap;
    });
  });

  return (
    <SpreadsheetDataContext.Provider value={spreadsheetGridData}>
      <div class="text-center">
        <MainTitle>Cấu trúc hóa bảng tính</MainTitle>
        <p class="mx-4">
          Trước khi bắt đầu, bạn cần cấu trúc bảng tính sao cho ứng dụng có thể
          hiểu và quản lí các confession sẵn có cũng như sau này.
          <br />
          Hãy chọn một trong những cách khởi tạo sau:
        </p>
        <div class="flex flex-col my-10 mx-4 justify-center md:flex-row">
          {initOptionsMetadatas.map((option, index) => {
            const toggler = () => handleToggleModal(index);
            return (
              <>
                <button
                  class="block max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 md:mx-2 my-2"
                  onClick={toggler}
                >
                  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                    {option.title}
                  </h5>
                  <p class="font-normal text-gray-700">{option.description}</p>
                </button>
                <option.modal
                  title={option.title}
                  isShow={modalShows[index]}
                  handleClose={toggler}
                />
              </>
            );
          })}
        </div>
        <p>
          <b>* Lưu ý: </b>
          Trang tính được định nghĩa là các trang tính: trang tính chứa câu trả
          lời, trang tính "đã duyệt", trang tính "đã đăng", trang tính "đã từ
          chối"
        </p>
      </div>
    </SpreadsheetDataContext.Provider>
  );
};

export default InitSheets;
export const useSpreadsheetData = () => useContext(SpreadsheetDataContext);
