import handlePick from "methods/handlePick";
import { Component, batch, onMount } from "solid-js";
import Button from "ui-components/Button";
import {
  confessionSpreadsheet,
  picker,
  setPicker,
  setConfessionSpreadsheet,
} from "store";
import LoadingCircle from "ui-components/LoadingCircle";
import initConfessionSpreadsheetMetadata from "methods/initConfessionSpreadsheetMetadata";

const SelectSpreadsheet: Component = () => {
  onMount(async () => {
    const cachedSpreadsheetId = localStorage.getItem("confessionSpreadsheetId");

    const fetchAndInitSpreadsheet = async (spreadsheetId: string) => {
      const result = (
        await gapi.client.sheets.spreadsheets.get({
          spreadsheetId,
        })
      ).result;
      batch(() => {
        setConfessionSpreadsheet(result);
        initConfessionSpreadsheetMetadata();
      });
      console.log(confessionSpreadsheet());
    };

    if (cachedSpreadsheetId !== null) {
      await fetchAndInitSpreadsheet(cachedSpreadsheetId);
      return;
    }
    gapi.load("picker", async () => {
      const pickerCallback = async (res: google.picker.ResponseObject) => {
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          await fetchAndInitSpreadsheet(res.docs[0].id);
          localStorage.setItem("confessionSpreadsheetId", res.docs[0].id);
        }
      };
      setPicker(
        new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.SPREADSHEETS)
          .setMaxItems(1)
          .setOAuthToken(gapi.client.getToken().access_token)
          .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
          .setCallback(pickerCallback)
          .setTitle("Chọn trang tính chứa câu trả lời Confession của bạn")
          .build()
      );
    });
  });

  return (
    <div class="flex flex-col justify-center h-full">
      <div class="flex px-4 flex-col items-center justify-center">
        <h1 class="text-2xl mb-10">
          Chọn một trang tính chứa câu trả lời Confession để bắt đầu
        </h1>
        <Button
          onClick={handlePick}
          disabled={!picker()}
          class="text-xl text-white bg-[#4285F4] hover:bg-[#4285F4]/90 px-7 py-5 text-center inline-flex items-center"
        >
          {picker() ? "Chọn trang tính" : <LoadingCircle />}
        </Button>
      </div>
    </div>
  );
};

export default SelectSpreadsheet;
