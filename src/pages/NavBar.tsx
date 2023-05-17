import handleLogout from "methods/handleLogout";
import { Component, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import Button from "ui-components/Button";

const NavBar: Component = () => {
  const [isLoggingOut, setLoggingOut] = createSignal(false);

  const handleLogoutClick = async () => {
    setLoggingOut(true);
    await handleLogout();
    setLoggingOut(false);
  };

  return (
    <Portal>
      <Button
        class="fixed top-0"
        onClick={handleLogoutClick}
        disabled={isLoggingOut()}
      >
        Đăng xuất
      </Button>
    </Portal>
  );
};

export default NavBar;
