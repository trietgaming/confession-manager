import useLoading from "app-hooks/useLoading";
import FacebookAccountManager from "controllers/FacebookAccountManager";
import {
  Component,
  Match,
  Show,
  Switch,
  createEffect
} from "solid-js";
import { facebookUser, isFacebookLoaded } from "store/index";
import Button from "ui-components/Button";
import LoadingCircle from "ui-components/LoadingCircle";

const FacebookButton: Component = () => {
  const [wrapButtonLoading, isButtonLoading, setButtonLoading] =
    useLoading(true);
  createEffect(() => {
    if (facebookUser() !== undefined) {
      setButtonLoading(false);
    }
  });

  const handleLogoutClick = wrapButtonLoading(async () => {
    await FacebookAccountManager.logout();
  });

  const handleLoginClick = wrapButtonLoading(async () => {
    await FacebookAccountManager.login();
  });

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
