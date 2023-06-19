import fetchFacebookUserFromAuthResponse from "methods/fetchFacebookUserFromAuthResponse";
import handleFbLogin from "methods/handleFbLogin";
import handleFBLogout from "methods/handleFbLogout";
import {
  Component,
  Match,
  Show,
  Switch,
  batch,
  createEffect,
  createSignal,
} from "solid-js";
import { reconcile } from "solid-js/store";
import {
  accessibleFacebookPages,
  facebookUser,
  isFacebookLoaded,
  setAccessibleFacebookPages,
  setFacebookUser,
} from "store/index";
import Button from "ui-components/Button";
import LoadingCircle from "ui-components/LoadingCircle";

const FacebookButton: Component = () => {
  const [isButtonLoading, setButtonLoading] = createSignal(true);
  createEffect(() => {
    if (facebookUser() !== undefined) {
      setButtonLoading(false);
    }
  });

  const handleLogoutClick = async () => {
    setButtonLoading(true);
    await handleFBLogout();
    setButtonLoading(false);
  };

  const handleLoginClick = async () => {
    setButtonLoading(true);
    await handleFbLogin();
    setButtonLoading(false);
  };
  return (
    <Show when={isFacebookLoaded()} fallback={<LoadingCircle />}>
      <Switch>
        <Match when={!facebookUser()}>
          <Button disabled={isButtonLoading()} onClick={handleLoginClick}>
            Liên kết
          </Button>
        </Match>
        <Match when={facebookUser()}>
          <p>{facebookUser()?.name}</p>
          <Button disabled={isButtonLoading()} onClick={handleLogoutClick}>
            Đăng xuất
          </Button>
        </Match>
      </Switch>
    </Show>
  );
};

export default FacebookButton;
