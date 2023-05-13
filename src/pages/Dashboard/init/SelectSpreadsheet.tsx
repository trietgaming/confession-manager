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
      console.log(confessionSpreadsheet);
    };

    /// REMOVE THIS AFTER DEBUG

    // if (cachedSpreadsheetId !== null) {
    //   await fetchAndInitSpreadsheet(cachedSpreadsheetId);
    //   return;
    // }
    gapi.load("picker", async () => {
      const pickerCallback = async (res: google.picker.ResponseObject) => {
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          console.log(res);
          let spreadsheetId = res.docs[0].id;
          /// @ts-ignore
          if (res.docs[0].serviceId === "form") {
            try {
              const response = await fetch(
                "https://forms.googleapis.com/v1/forms/" + res.docs[0].id,
                {
                  headers: {
                    Authorization: `Bearer ${
                      gapi.client.getToken().access_token
                    }`,
                    Accept: "application/json",
                  },
                }
              );
              console.log(response);
              const json: gapi.client.forms.Form = await response.json();
              if (json.linkedSheetId) {
                spreadsheetId = json.linkedSheetId;
              } else {
                ///TODO: redirect user to create and link spreadsheet, and provide a way how to do that.
                /// The APIs are not possible to link form with a spreadsheet
                return alert("Biểu mẫu này chưa có trang tính")
              }
            } catch (err) {
              console.error(err);
            }
          }
          await fetchAndInitSpreadsheet(spreadsheetId);
          localStorage.setItem("confessionSpreadsheetId", res.docs[0].id);
        }
      };
      setPicker(
        new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.SPREADSHEETS)
          .addView(google.picker.ViewId.FORMS)
          .setMaxItems(1)
          .setOAuthToken(gapi.client.getToken().access_token)
          .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
          .setCallback(pickerCallback)
          .setTitle(
            "Chọn trang tính hoặc biểu mẫu nhận câu trả lời Confession của bạn"
          )
          .build()
      );
    });
  });

  return (
    <div class="flex flex-col justify-center h-full">
      <div class="flex px-4 flex-col items-center justify-center">
        <h1 class="text-2xl mb-10">
          Chọn một trang tính chứa câu trả lời Confession hoặc biểu mẫu nhận
          Confession để bắt đầu
        </h1>
        <Button
          onClick={handlePick}
          disabled={!picker()}
          class="text-xl text-white bg-[#4285F4] hover:bg-[#4285F4]/90 px-7 py-5 text-center inline-flex items-center"
        >
          {picker() ? "Chọn trang tính hoặc biểu mẫu" : <LoadingCircle />}
        </Button>
      </div>
    </div>
  );
};

export default SelectSpreadsheet;
