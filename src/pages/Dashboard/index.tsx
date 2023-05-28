import { Component, Switch, Match, createMemo } from "solid-js";
import { confessionMetadata, confessionSpreadsheet } from "store/index";
import SelectSpreadsheet from "./init/SelectSpreadsheet";
import DashboardComponent from "./Dashboard";
import SelectSheets from "./init/SelectSheets";
import {
  IS_SHEETS_INITED_METADATA_KEY,
  SHEETS_INITED_TYPES,
} from "app-constants";
import InitSheets from "./init/InitSheets";
import createSignalObjectEmptyChecker from "methods/createSignalObjectEmptyChecker";

const checkSheetInited = () => {
  console.log("checking")
  console.log(confessionSpreadsheet);
  if (!confessionSpreadsheet || !confessionSpreadsheet.developerMetadata)
    return false;
  const metadata = confessionSpreadsheet!.developerMetadata!.find(
    (metadata) => metadata.metadataKey === IS_SHEETS_INITED_METADATA_KEY
  );
  return (
    metadata &&
    ((metadata.metadataValue === SHEETS_INITED_TYPES.FRESH &&
      !!confessionMetadata.archivedSheet) ||
      metadata.metadataValue === SHEETS_INITED_TYPES.FILTERED)
  );
};

const Dashboard: Component = () => {
  const isConfessionMetadataEmpty =
    createSignalObjectEmptyChecker(confessionMetadata);
  const isConfessionSpreadsheetObjEmpty = createSignalObjectEmptyChecker(
    confessionSpreadsheet
  );
  const isSheetInited = createMemo(checkSheetInited);
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
