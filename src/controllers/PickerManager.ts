import { picker, setPicking } from "store/index";
import fetchAndInitSpreadsheet from "methods/fetchAndInitSpreadsheet";
import GoogleAccountManager from "controllers/GoogleAccountManager";

const pickerCallback = async (res: google.picker.ResponseObject) => {
  setPicking(true);
  if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    console.log(res);
    await fetchAndInitSpreadsheet({
      /// @ts-ignore
      [res.docs[0].serviceId === "form" ? "formId" : "spreadsheetId"]:
        res.docs[0].id,
    });
  }
  setPicking(false);
};

export default class PickerManager {
  static build() {
    return new google.picker.PickerBuilder()
      .setAppId("1041449841105")
      .addView(google.picker.ViewId.SPREADSHEETS)
      .addView(google.picker.ViewId.FORMS)
      .setMaxItems(1)
      .setOAuthToken(gapi.client.getToken().access_token)
      .setCallback(pickerCallback)
      .setTitle(
        "Chọn bảng tính hoặc biểu mẫu nhận câu trả lời Confession của bạn"
      )
      .build();
  }

  static showPicker() {
    if (gapi.client.getToken() === null) {
      GoogleAccountManager.login();
      return;
    }

    picker()?.setVisible(true);
  }
}
