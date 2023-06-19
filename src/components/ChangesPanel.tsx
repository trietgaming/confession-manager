import { Component, Show, batch, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import {
  confessionMetadata,
  confessionSpreadsheet,
  pendingChanges,
  resetPendingChanges,
  setScrollY,
  scrollY,
  sheetsLastRow,
  hiddenConfessionRows,
} from "store/index";
import Button from "ui-components/Button";
import hadChanges from "app-hooks/hadChanges";
import { PENDING_CHANGES_CONFESSION_ARRAY_KEYS } from "../constants";
import Confession from "classes/Confesison";
import { PendingChanges, SheetTypeKeys } from "types";
import resetConfessions from "methods/resetConfessions";
import LoadingCircle from "ui-components/LoadingCircle";

const ChangesPanel: Component = () => {
  const [isSubmitting, setSubmitting] = createSignal(false);

  const handleCancel = () => {
    for (const key of PENDING_CHANGES_CONFESSION_ARRAY_KEYS) {
      for (
        let i = 0, n = (pendingChanges[key]! as Confession[]).length;
        i < n;
        ++i
      ) {
        const cfs = (pendingChanges[key]! as Confession[])[i];
        cfs.setHidden(false);
      }
      pendingChanges[key] = [];
    }
  };
  const handleSaveChanges = async () => {
    setSubmitting(true);
    // console.log(pendingChanges);
    const sheetMap: {
      [key in keyof PendingChanges]: number; // SheetId
    } = {
      accepts: confessionMetadata.acceptedSheet?.properties?.sheetId!,
      cancels: confessionMetadata.pendingSheet?.properties?.sheetId!,
      declines: confessionMetadata.declinedSheet?.properties?.sheetId!,
    };
    const sheetTypeMap: { [key in keyof PendingChanges]: SheetTypeKeys } = {
      accepts: "acceptedSheet",
      cancels: "pendingSheet",
      declines: "declinedSheet",
    };
    const batchRequests: gapi.client.sheets.Request[] = [];

    for (const changeKey in pendingChanges) {
      const confesisons = pendingChanges[changeKey as keyof PendingChanges];
      if (!confesisons || confesisons.length === 0) continue;

      const sheetId = sheetMap[changeKey as keyof PendingChanges];

      const rows: gapi.client.sheets.RowData[] = [];

      for (let i = 0, n = confesisons.length; i < n; ++i) {
        const confession = confesisons[i];
        const row: gapi.client.sheets.CellData[] = confession.raw.map(
          (val) => ({
            userEnteredValue: {
              stringValue: val,
            },
          })
        );

        batchRequests.push({
          deleteDimension: {
            range: {
              dimension: "ROWS",
              sheetId: confession.in.properties?.sheetId!,
              startIndex: confession.row - 1, // this is 0-based index but confession.row is 1-based
              endIndex: confession.row,
            },
          },
        });
        if (confession.in === confessionMetadata.pendingSheet)
          sheetsLastRow.pendingSheet && (sheetsLastRow.pendingSheet -= 1);
        if (confession.in === confessionMetadata.acceptedSheet)
          sheetsLastRow.acceptedSheet && (sheetsLastRow.acceptedSheet -= 1);
        if (confession.in === confessionMetadata.declinedSheet)
          sheetsLastRow.declinedSheet && (sheetsLastRow.declinedSheet -= 1);

        rows.push({
          values: row,
        });
      }

      batchRequests.push({
        appendCells: {
          sheetId,
          rows,
          fields: "userEnteredValue",
        },
      });
      if (
        typeof sheetsLastRow[
          sheetTypeMap[changeKey as keyof PendingChanges] as SheetTypeKeys
        ] === "number"
      )
        sheetsLastRow[
          sheetTypeMap[changeKey as keyof PendingChanges] as SheetTypeKeys
        ]! += rows.length;
    }
    if (batchRequests.length) {
      batchRequests.sort((a, b) => {
        if (a.deleteDimension && b.deleteDimension)
          return (
            b.deleteDimension.range!.startIndex! -
            a.deleteDimension.range!.startIndex!
          );
        if (a.appendCells) return 1;
        return -1;
      });
      try {
        await gapi.client.sheets.spreadsheets.batchUpdate(
          {
            spreadsheetId: confessionSpreadsheet.spreadsheetId!,
          },
          {
            includeSpreadsheetInResponse: false,
            requests: batchRequests,
          }
        );
      } catch (err) {
        alert("Đã có lỗi xảy ra");
        console.error(err);
      }
    }
    batch(() => {
      setSubmitting(false);
      hiddenConfessionRows.hidden = {};
      resetConfessions();
      resetPendingChanges();
    });
  };
  return (
    <Show when={hadChanges()}>
      <Portal>
        <div>
          <div class="fixed inset-0 z-10 overflow-y-auto pointer-events-none">
            <div class="flex flex-col h-full justify-end p-4 text-center sm:items-center sm:p-0">
              <div class="mr-4 w-full self-end transform overflow-hidden rounded-lg text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-lg">
                <div class="pointer-events-auto flex flex-col md:flex-row justify-between bg-white px-4 py-3 sm:px-6">
                  <h3 class="flex flex-col justify-center text-center sm:ml-4 sm:mt-0 sm:text-left text-base font-semibold text-gray-900">
                    Bạn có muốn lưu thay đổi?
                  </h3>
                  <div class="py-2 flex space-x-2">
                    <Button
                      onClick={handleSaveChanges}
                      class="my-0 inline-flex space-x-2 w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      disabled={isSubmitting()}
                    >
                      <p>Lưu</p>
                      <Show when={isSubmitting()}>
                        <LoadingCircle />
                      </Show>
                    </Button>
                    <Button
                      onClick={handleCancel}
                      class="my-0 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
      </Portal>
    </Show>
  );
};

export default ChangesPanel;
