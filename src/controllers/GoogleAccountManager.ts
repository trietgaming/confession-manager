import _login from "./GoogleAccountManager/login";
import _logout from "./GoogleAccountManager/logout";
export default class GoogleAccountManager {
  static login = _login;
  static logout = _logout;
}
