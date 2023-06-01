import FreshStartModal from "pages/Dashboard/init/InitSheets/FreshStartModal";
import Color from "../classes/Color";
import { PENDING_CONFESSION_ACTION } from "../constants";
import ConditionalFilteringModal from "pages/Dashboard/init/InitSheets/ConditionalFilteringModal";

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

export type RGB =
  | {
      red?: number;
      green?: number;
      blue?: number;
    }
  | gapi.client.sheets.Color;

export interface ThemeMap {
  TEXT: Color;
  BACKGROUND: Color;
  ACCENT1: Color;
  ACCENT2: Color;
  ACCENT3: Color;
  ACCENT4: Color;
  ACCENT5: Color;
  ACCENT6: Color;
  LINK: Color;
  [key: string]: Color;
}

export type TextFormat = "bold" | "italic" | "underline" | "strikethrough";

export type TextFormatObject = {
  [key in TextFormat]: boolean;
};

export interface Conditions {
  backgroundColor?: Color;
  textFormat?: TextFormat;
  foregroundColor?: Color;
}

export type ConditionMetadata = {
  key: keyof Conditions;
  title: string;
};

export type InitOptionsMetadatas = {
  title: string;
  description: string;
  modal: typeof FreshStartModal | typeof ConditionalFilteringModal;
}[];

export type CellColor = { color: Color; rowIndex: number };
export type CellTextFormat = {
  rowIndex: number;
  format: { [K in TextFormat]: boolean };
};
export type ConfessionSpreadsheetGridData = {
  rowData: gapi.client.sheets.RowData[];
  backgroundColor: CellColor[];
  foregroundColor: CellColor[];
  textFormat: CellTextFormat[];
  selected: {
    [key in FilteredSheetMetadata["key"]]: {
      backgroundColor: CellColor[];
      foregroundColor: CellColor[];
      textFormat: CellTextFormat[];
    };
  };
  themeMap: ThemeMap;
};

export type FilteredSheetMetadata = {
  key: keyof Omit<
    ConfessionSpreadsheetMetadata,
    "inited" | "archivedSheet" | "pendingSheet"
  >;
  title: string;
};

export type SheetTypeKeys = keyof Omit<
  ConfessionSpreadsheetMetadata,
  "inited" | "archivedSheet"
>;
export type SelectedObject = Record<SheetTypeKeys, number | null>;

export type PreviewSheetKeys =
  | keyof ConfessionSpreadsheetGridData["selected"]
  | "pendingSheet";
