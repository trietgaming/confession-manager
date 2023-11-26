import { ParentComponent, Show, createSignal, splitProps } from "solid-js";
import Button, { ButtonProps } from "./Button";
import LoadingCircle from "./LoadingCircle";

/**
 * Button with loading state that disables clicking until Promise is resolved and shows the loading circle when loading
 *
 */
const LButton: ParentComponent<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "onClick",
    "disabled",
    "children",
  ]);
  const [isLoading, setLoading] = createSignal(false);
  return (
    <Button
      onClick={async () => {
        if (local.onClick) {
          setLoading(true);
          try {
            await local.onClick();
          } finally {
            setLoading(false);
          }
        }
      }}
      disabled={local.disabled || isLoading()}
      {...others}
    >
      <div class="flex items-center space-x-2">
        {local.children}
        <Show when={isLoading()}>
          <LoadingCircle />
        </Show>
      </div>
    </Button>
  );
};

export default LButton;
