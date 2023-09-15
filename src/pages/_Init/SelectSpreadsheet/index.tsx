import { Component, createEffect, createSignal } from "solid-js";
import { picker, isPicking } from "store";
import SelectSpreadsheetComponent from "./SelectSpreadsheet";

const SelectSpreadsheet: Component = () => {
  const [isLoading, setLoading] = createSignal(true);

  createEffect(() => {
    if (picker()) setLoading(false);
  });

  return <SelectSpreadsheetComponent isLoading={isPicking() || isLoading()} />;
};

export default SelectSpreadsheet;
