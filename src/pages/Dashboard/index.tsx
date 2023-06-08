import { Component, Switch, Match, createMemo } from "solid-js";
import { confessionMetadata, confessionSpreadsheet, isSheetInited } from "store/index";
import SelectSpreadsheet from "./init/SelectSpreadsheet";
import DashboardComponent from "./Dashboard";
import SelectSheets from "./init/SelectSheets";
import {
  IS_SHEETS_INITED_METADATA_KEY,
  SHEETS_INITED_TYPES,
} from "app-constants";
import InitSheets from "./init/InitSheets";
import createSignalObjectEmptyChecker from "methods/createSignalObjectEmptyChecker";

const Dashboard: Component = () => {
  const isConfessionMetadataEmpty =
  createSignalObjectEmptyChecker(confessionMetadata);
  const isConfessionSpreadsheetObjEmpty = createSignalObjectEmptyChecker(
    confessionSpreadsheet
    );
    
  return (
    <Switch>
      <Match when={isConfessionSpreadsheetObjEmpty()}>
        <SelectSpreadsheet />
      </Match>
      <Match when={isConfessionMetadataEmpty()}>
        <SelectSheets />
      </Match>
      <Match when={!isSheetInited()}>
        <InitSheets />
      </Match>
      <Match
        when={
          !isConfessionSpreadsheetObjEmpty() && !isConfessionMetadataEmpty()
        }
      >
        <DashboardComponent />
      </Match>
    </Switch>
  );
};

export default Dashboard;
