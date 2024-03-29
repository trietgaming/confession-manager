import {
  CONFESSION_SHEET_TYPE_METADATA_KEY,
  SHEETS_INITED_TYPES,
} from "app-constants";
import useLoading from "app-hooks/useLoading";
import AppSpreadsheetManager from "controllers/AppSpreadsheetManager";
import { Component, JSX, createSignal } from "solid-js";
import { confessionMetadata, confessionSpreadsheet } from "store/index";
import { ConfessionSpreadsheetMetadata } from "types";
import Modal from "ui-components/Modal";

const FreshStartModal: Component<{
  title: string;
  isShow?: boolean;
  handleClose?: () => any;
}> = (props) => {
  const [sheetTitle, setSheetTitle] = createSignal("");
  const [wrapLoading, isLoading] = useLoading(false);

  const handleChange: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (
    e
  ) => {
    setSheetTitle(e.currentTarget.value);
  };

  const handleSubmit = wrapLoading(async () => {
    const archivedSheetTitle = sheetTitle();
    const spreadsheetId = confessionSpreadsheet.spreadsheetId!;
    try {
      const batchRequests: gapi.client.sheets.Request[] = [
        {
          duplicateSheet: {
            insertSheetIndex: confessionSpreadsheet.sheets?.length,
            newSheetName: archivedSheetTitle,
            sourceSheetId:
              confessionMetadata.pendingSheet!.properties!.sheetId!,
          },
        },
      ];

      (
        [
          "acceptedSheet",
          "declinedSheet",
          "postedSheet",
        ] as (keyof ConfessionSpreadsheetMetadata)[]
      ).forEach((sheetKey) => {
        const sheetId = (
          confessionMetadata[sheetKey] as gapi.client.sheets.Sheet
        ).properties?.sheetId!;
        batchRequests.push({
          copyPaste: {
            destination: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            source: {
              sheetId: confessionMetadata.pendingSheet?.properties?.sheetId!,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            pasteType: "PASTE_VALUES",
            pasteOrientation: "NORMAL",
          },
        });
        batchRequests.push({
          updateSheetProperties: {
            fields: "gridProperties.frozenRowCount",
            properties: {
              sheetId,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        });
      });

      const duplicateSheetResult = (
        await gapi.client.sheets.spreadsheets.batchUpdate(
          {
            spreadsheetId,
          },
          {
            requests: batchRequests,
          }
        )
      ).result;

      const archivedSheetId = (
        duplicateSheetResult.replies as gapi.client.sheets.Response[]
      )[0].duplicateSheet!.properties!.sheetId!;

      console.log(duplicateSheetResult);
      if (!duplicateSheetResult.replies) {
        throw "unexpected";
      }
      await gapi.client.sheets.spreadsheets.batchUpdate(
        {
          spreadsheetId: confessionSpreadsheet.spreadsheetId!,
        },
        {
          includeSpreadsheetInResponse: false,
          requests: [
            {
              createDeveloperMetadata: {
                developerMetadata: {
                  location: {
                    sheetId: archivedSheetId,
                  },
                  metadataKey: CONFESSION_SHEET_TYPE_METADATA_KEY,
                  metadataValue: "archivedSheet",
                  visibility: "PROJECT",
                },
              },
            },
            {
              deleteDimension: {
                range: {
                  dimension: "ROWS",
                  startIndex: 1,
                  endIndex:
                    confessionMetadata.pendingSheet?.properties?.gridProperties!
                      .rowCount! - 1,
                  sheetId:
                    confessionMetadata.pendingSheet?.properties?.sheetId!,
                },
              },
            },
          ],
        }
      );

      await AppSpreadsheetManager.refresh(
        await AppSpreadsheetManager.setConfessionInited(
          SHEETS_INITED_TYPES.FRESH
        )
      );
    } catch (err) {
      console.error(err);
    }
  });

  return (
    <Modal
      title={props.title}
      isShow={props.isShow}
      handleClose={props.handleClose}
      handleSubmit={handleSubmit}
      loading={isLoading()}
    >
      <label
        for="title-input"
        class="block mb-2 text-sm font-medium text-gray-900"
      >
        Tiêu đề trang tính lưu trữ các confession cũ
      </label>
      <input
        type="text"
        id="title-input"
        class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500"
        value={sheetTitle()}
        onInput={handleChange}
      />
      <p class="mt-2">
        Vui lòng duyệt hoặc đăng bài các confession đã lưu trữ một cách thủ công
        trước khi bắt đầu sử dụng ứng dụng.
      </p>
    </Modal>
  );
};

export default FreshStartModal;
