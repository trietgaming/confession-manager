import { APP_SCRIPT_RUN_URL } from "app-constants";
import axios from "axios";

export default class AppScriptApi {
  static getLastRowPositionHasValue(spreadsheetId: string, sheetName: string) {
    return this.callFunction<number>("getLastRowPositionHasValue", [
      spreadsheetId,
      sheetName,
    ]);
  }

  static getLinkedFormId(spreadsheetId: string) {
    return this.callFunction<string>("getLinkedFormId", [spreadsheetId]);
  }

  static subscribeToFormResponse(spreadsheetId: string) {
    return this.callFunction<null>("subscribeToFormResponse", [spreadsheetId]);
  }

  static linkFormToSpreadsheet(formId: string, spreadsheetId: string) {
    return this.callFunction<null>("linkFormToSpreadsheet", [
      formId,
      spreadsheetId,
    ]);
  }

  static async callFunction<ReturnType extends any>(
    functionName: string,
    params: any[]
  ) {
    const response = (
      await axios.post<{
        done?: boolean;
        error?: boolean;
        response?: {
          "@type": string;
          result: ReturnType;
        };
      }>(
        APP_SCRIPT_RUN_URL,
        {
          function: functionName,
          parameters: params,
        },
        {
          headers: {
            Authorization: `Bearer ${gapi.client.getToken().access_token}`,
          },
        }
      )
    ).data;

    if (response.error || !response.done)
      throw "Error occured when calling AppScriptApi";

    return response.response!.result;
  }
}
