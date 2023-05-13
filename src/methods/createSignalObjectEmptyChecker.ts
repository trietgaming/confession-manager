import { Accessor, createMemo } from "solid-js";
import { Store } from "solid-js/store";
import isObjectEmpty from "./isObjectEmpty";

export default function createSignalObjectEmptyChecker(
  obj: Accessor<Object> | Store<Object>
) {
  return createMemo<boolean>(() =>
    isObjectEmpty(typeof obj === "object" ? obj : (obj as Accessor<Object>)())
  );
}
