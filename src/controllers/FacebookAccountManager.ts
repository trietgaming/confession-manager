import _login from "controllers/FacebookAccountManager/login";
import _logout from "controllers/FacebookAccountManager/logout";
import _fetchFacebookUserFromAuthResponse from "controllers/FacebookAccountManager/fetchFacebookUserFromAuthResponse";

export default class FacebookAccountManager {
  static login = _login;
  static logout = _logout;
  static fetchFacebookUserFromAuthResponse = _fetchFacebookUserFromAuthResponse;
}
