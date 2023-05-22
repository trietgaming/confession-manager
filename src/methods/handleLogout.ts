import { APP_SERVER_URL } from "app-constants";
import axios from "axios";
import setAccessToken from "./setAccessToken";
export default async function handleLogout() {
  //TODO: RESET all state of prev user
  try {
    const response = await axios.post(APP_SERVER_URL + "/auth/logout", undefined, {
      withCredentials: true,
    });
    if (response.data.ok) {
      setAccessToken(null);
    } else {
      console.error(response.data);
    }
  } catch (err) {
    console.error(err);
  }
}
