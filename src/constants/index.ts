import { PendingChanges } from "types";

export const POSTED_COLOR = "#74b9ff";
export const DECLINED_COLOR = "#fc5c65";
export const ACCEPTED_COLOR = "#7bed9f";

// export const POSTED_COLOR_METADATA_KEY = "cfs_posted_color";
// export const DECLINED_COLOR_METADATA_KEY = "cfs_declined_color";
// export const ACCEPTED_COLOR_METADATA_KEY = "cfs_accepted_color";

// export const POSTED_SHEET_ID_METADATA_KEY = "cfs_posted_sheet_id";
// export const DECLINED_SHEET_ID_METADATA_KEY = "cfs_declined_sheet_id";
// export const ACCEPTED_SHEET_ID_METADATA_KEY = "cfs_accepted_sheet_id";

// export const METADATA_KEYS_NEEDED = [
//   POSTED_COLOR_METADATA_KEY,
//   DECLINED_COLOR_METADATA_KEY,
//   ACCEPTED_COLOR_METADATA_KEY,
//   POSTED_SHEET_ID_METADATA_KEY,
//   DECLINED_SHEET_ID_METADATA_KEY,
//   ACCEPTED_SHEET_ID_METADATA_KEY,
// ];

export const CONFESSION_SHEET_TYPE_METADATA_KEY = "cfs_sheet_type";

export const MAX_CFS_PER_LOAD = 100;

export const FETCH_TRIGGER_Y_OFFSET = 1500;

export const LOCAL_KEY_CONFESSION_SPREADSHEET_ID = "confessionSpreadsheetId";

export const IS_SHEETS_INITED_METADATA_KEY = "confession_manager_inited";

export enum PENDING_CONFESSION_ACTION {
  ACCEPT = "accepts",
  DECLINE = "declines",
}

export const PENDING_CHANGES_CONFESSION_ARRAY_KEYS: (keyof PendingChanges)[] = [
  "accepts",
  "declines",
];

export const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];

export const SCOPES =
  "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly";

export const APP_SERVER_URL =
  "https://confession-manager-server.trietgaming.repl.co";

export const BASE_URL =
  import.meta.env.MODE === "development" ? "https://localhost:8080" : "";
