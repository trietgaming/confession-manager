import { Component, Switch, Match } from "solid-js";
import { confessionMetadata, confessionSpreadsheet } from "store/index";
import SelectSpreadsheet from "components/SelectSpreadsheet";
import DashboardComponent from "./Dashboard";
import SelectSheets from "components/SelectSheets";

const Dashboard: Component = () => {
  return (
    <Switch>
      <Match when={!confessionSpreadsheet()}>
        <SelectSpreadsheet />
      </Match>
      <Match when={!confessionMetadata()}>
        <SelectSheets />
      </Match>
      <Match when={!!confessionSpreadsheet() && !!confessionMetadata()}>
        <DashboardComponent />
      </Match>
    </Switch>
  );
};

export default Dashboard;
