import { Accessor, Setter, createSignal } from "solid-js";

type Wrapper = <T>(fn: T) => T;

export default function useLoading(
  initialValue: boolean = false
): [Wrapper, Accessor<boolean>, Setter<boolean>] {
  const [isLoading, setLoading] = createSignal(initialValue);

  function wrapper<T>(fn: T) {
    return (async (...args: any) => {
      setLoading(true);
      return (fn as (...args: any) => Promise<any>)(...args).finally(() =>
        setLoading(false)
      );
    }) as T;
  }

  return [wrapper, isLoading, setLoading];
}
