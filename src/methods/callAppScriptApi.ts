import { APP_SCRIPT_RUN_URL } from "app-constants";
import axios from "axios";

interface AppScriptApiFunction {
  getLastRowPositionHasValue: {
    params: [string, string];
    return: number;
  };
  getLinkedFormId: {
    params: [string];
    return: string;
  };
  subscribeToFormResponse: {
    params: [string];
    return: null;
  };
}

export default function callAppScriptApi<T extends keyof AppScriptApiFunction>(
  functionName: T,
  params: AppScriptApiFunction[T]["params"]
) {
  return axios.post<{
    done?: boolean;
    error?: boolean;
    response?: {
      "@type": string;
      result: AppScriptApiFunction[T]["return"];
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
  );
}
