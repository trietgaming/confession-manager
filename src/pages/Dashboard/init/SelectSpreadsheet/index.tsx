import handlePick from "methods/handlePick";
import { Component, Show, batch, createSignal, onMount } from "solid-js";
import Button from "ui-components/Button";
import {
  confessionSpreadsheet,
  picker,
  setPicker,
  setConfessionSpreadsheet,
} from "store";
import SelectSpreadsheetComponent from "./SelectSpreadsheet";
import initConfessionSpreadsheetMetadata from "methods/initConfessionSpreadsheetMetadata";
import NoSpreadsheetLinked from "./NoSpreadsheetLinked";

const SelectSpreadsheet: Component = () => {
  const [isNoSpreadsheet, setNoSpreadSheet] = createSignal(false);
  const [isLoading, setLoading] = createSignal(true);
  const [formObj, setformObj] = createSignal<gapi.client.forms.Form | null>(
    null
  );

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
        setLoading(true);
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          console.log(res);
          let spreadsheetId = null;
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
                /// The APIs are not possible to link form to a spreadsheet
                batch(() => {
                  setNoSpreadSheet(true);
                  setformObj(json);
                });
              }
            } catch (err) {
              console.error(err);
            }
          } else {
            spreadsheetId = res.docs[0].id;
          }
          if (spreadsheetId !== null) {
            await fetchAndInitSpreadsheet(spreadsheetId);
            localStorage.setItem("confessionSpreadsheetId", res.docs[0].id);
          }
        }
        setLoading(false);
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
      setLoading(false);
    });
  });

  const handleReturn = () => {
    setNoSpreadSheet(false);
  };

  return (
    <Show
      when={isNoSpreadsheet()}
      fallback={
        <SelectSpreadsheetComponent
          handlePick={handlePick}
          isLoading={isLoading()}
        />
      }
    >
      <NoSpreadsheetLinked handleReturn={handleReturn} formObj={formObj()!} />
    </Show>
  );
};

export default SelectSpreadsheet;
