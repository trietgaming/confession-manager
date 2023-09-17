
import FacebookAccountManager from "controllers/FacebookAccountManager";
import {
  Component,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal
} from "solid-js";
import {
  facebookUser,
  isFacebookLoaded
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
    await FacebookAccountManager.logout();
    setButtonLoading(false);
  };

  const handleLoginClick = async () => {
    setButtonLoading(true);
    await FacebookAccountManager.login();
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
