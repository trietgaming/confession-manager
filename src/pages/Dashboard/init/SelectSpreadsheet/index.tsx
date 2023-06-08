import { Component, Show, createEffect, createSignal } from "solid-js";
import {
  confessionSpreadsheet,
  picker,
  confesisonForm,
  isPicking,
} from "store";
import SelectSpreadsheetComponent from "./SelectSpreadsheet";
import NoSpreadsheetLinked from "./NoSpreadsheetLinked";
import isObjectEmpty from "methods/isObjectEmpty";

const SelectSpreadsheet: Component = () => {
  const [isNoSpreadsheet, setNoSpreadSheet] = createSignal(false);
  const [isLoading, setLoading] = createSignal(true);

  createEffect(() => {
    if (picker()) setLoading(false);
    if (!isPicking() && !isObjectEmpty(confesisonForm) && isObjectEmpty(confessionSpreadsheet))
      setNoSpreadSheet(true);
  });

  const handleReturn = () => {
    setNoSpreadSheet(false);
  };

  return (
    <Show
      when={isNoSpreadsheet()}
      fallback={
        <SelectSpreadsheetComponent
          isLoading={isPicking() || isLoading()}
        />
      }
    >
      <NoSpreadsheetLinked handleReturn={handleReturn} />
    </Show>
  );
};

export default SelectSpreadsheet;
