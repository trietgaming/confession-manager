import { Component, Setter } from "solid-js";
import { PENDING_CONFESSION_ACTION } from "../constants";

export interface Confession {
  row: number;
  data: string;
  date: string;
  ref?: Component;
}

export interface ConfessionSpreadsheetMetadata {
  acceptedSheet?: gapi.client.sheets.Sheet;
  declinedSheet?: gapi.client.sheets.Sheet;
  postedSheet?: gapi.client.sheets.Sheet;
  pendingSheet?: gapi.client.sheets.Sheet;
}

export interface PendingChanges {
  accepts?: Confession[];
  declines?: Confession[];
  post?: Confession[];
  addSheet?: {
    type: keyof ConfessionSpreadsheetMetadata;
    title: string;
  };
  updateSheetMetadata?: {
    sheetId: number;
    newType: keyof ConfessionSpreadsheetMetadata;
  };
}

export type HandleAction = (
  actionType: `${PENDING_CONFESSION_ACTION}`,
  confession: Confession,
  setHidden: Setter<boolean>
) => any
// export interface ConfessionSheets {
//   accepted:
// }
