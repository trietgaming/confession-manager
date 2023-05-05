import { tokenClient } from "store";

export default () => {
  tokenClient()!.requestAccessToken();
};
