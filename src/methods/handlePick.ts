import { picker } from "store";
import handleLogin from "./handleLogin";

const handlePick = () => {
  if (gapi.client.getToken() === null) {
    handleLogin();
    return;
  }

  picker()?.setVisible(true);
};

export default handlePick;
