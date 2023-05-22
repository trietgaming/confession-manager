import { Component, Switch, Match } from "solid-js";
import { confessionMetadata, confessionSpreadsheet } from "store/index";
import SelectSpreadsheet from "./init/SelectSpreadsheet";
import DashboardComponent from "./Dashboard";
import SelectSheets from "./init/SelectSheets";
import { IS_SHEETS_INITED_METADATA_KEY } from "app-constants";
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
      {/* <Match
        when={
          !confessionSpreadsheet!.developerMetadata ||
          confessionSpreadsheet!.developerMetadata!.some(
            (metadata) =>
              metadata.metadataKey === IS_SHEETS_INITED_METADATA_KEY &&
              metadata.metadataValue === "1"
          )
        }
      >
        <InitSheets />
      </Match> */}
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
