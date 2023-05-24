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
import axios from "axios";
import localforage from "localforage";
import {
  LOCAL_KEY_CONFESSION_FORM_ID,
  LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
} from "app-constants";

const SelectSpreadsheet: Component = () => {
  const [isNoSpreadsheet, setNoSpreadSheet] = createSignal(false);
  const [isLoading, setLoading] = createSignal(true);
  const [formObj, setformObj] = createSignal<gapi.client.forms.Form | null>(
    null
  );

  onMount(async () => {
    const cachedSpreadsheetId: string | null = await localforage.getItem(
      LOCAL_KEY_CONFESSION_SPREADSHEET_ID
    );

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

    if (cachedSpreadsheetId !== null) {
      await fetchAndInitSpreadsheet(cachedSpreadsheetId);
      return;
    }
    gapi.load("picker", async () => {
      const pickerCallback = async (res: google.picker.ResponseObject) => {
        setLoading(true);
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          console.log(res);
          let spreadsheetId = null;
          /// @ts-ignore
          if (res.docs[0].serviceId === "form") {
            try {
              const response = await gapi.client.forms.forms.get({
                formId: res.docs[0].id,
              });
              console.log(response);
              const form: gapi.client.forms.Form = response.result;
              if (form.linkedSheetId) {
                spreadsheetId = form.linkedSheetId;
                localforage.setItem(LOCAL_KEY_CONFESSION_FORM_ID, form.formId);
              } else {
                /// The APIs are not possible to link form to a spreadsheet
                batch(() => {
                  setNoSpreadSheet(true);
                  setformObj(form);
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
            await localforage.setItem(
              LOCAL_KEY_CONFESSION_SPREADSHEET_ID,
              spreadsheetId
            );
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
            "Chọn bảng tính hoặc biểu mẫu nhận câu trả lời Confession của bạn"
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
