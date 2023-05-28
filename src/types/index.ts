import { PENDING_CONFESSION_ACTION } from "../constants";

export interface Confession {
  row: number;
  data: string;
  date: string;
}

export interface ConfessionSpreadsheetMetadata {
  acceptedSheet?: gapi.client.sheets.Sheet;
  declinedSheet?: gapi.client.sheets.Sheet;
  postedSheet?: gapi.client.sheets.Sheet;
  pendingSheet?: gapi.client.sheets.Sheet;
  archivedSheet?: gapi.client.sheets.Sheet;
  inited?: boolean;
}

export interface ConfessionElement extends Confession {
  ref: HTMLLIElement;
}

export interface PendingChanges {
  accepts?: ConfessionElement[];
  declines?: ConfessionElement[];
  post?: ConfessionElement[];
  addSheets?: {
    type: keyof ConfessionSpreadsheetMetadata;
    title: string;
  }[];
  updateSheetMetadata?: {
    sheetId: number;
    newType: keyof ConfessionSpreadsheetMetadata;
  };
}

export type HandleAction = (
  actionType: `${PENDING_CONFESSION_ACTION}`,
  confession: Confession,
  ref: HTMLLIElement
) => any;

export type RGB = {
  red: number,
  green: number,
  blue: number
}