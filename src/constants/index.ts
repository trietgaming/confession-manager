import { PendingChanges } from "types";

// export const POSTED_COLOR = "#74b9ff";
// export const DECLINED_COLOR = "#fc5c65";
// export const ACCEPTED_COLOR = "#7bed9f";

export const CONFESSION_SHEET_TYPE_METADATA_KEY = "cfs_sheet_type";

export const MAX_CFS_PER_LOAD = 100;

export const FETCH_TRIGGER_Y_OFFSET = 1500;

export const LOCAL_KEY_CONFESSION_SPREADSHEET_ID = "confession_spreadsheet_id";

export const IS_SHEETS_INITED_METADATA_KEY = "confession_manager_inited";

export enum PENDING_CONFESSION_ACTION {
  ACCEPT = "accepts",
  DECLINE = "declines",
  CANCEL = "cancels",
  POST = "post",
}

export enum SHEETS_INITED_TYPES {
  FRESH = "fresh",
  FILTERED = "filtered",
}

export const PENDING_CHANGES_CONFESSION_ARRAY_KEYS: (keyof PendingChanges)[] = [
  "accepts",
  "declines",
  "cancels",
  "post",
];

export const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];

export const SCOPES = "https://www.googleapis.com/auth/drive";

export const APP_SCRIPT_RUN_URL =
  "https://script.googleapis.com/v1/scripts/AKfycbx1z61KgHlJxPtJjUp1LS4N9BK-4BDnySVLj2ESrUCEaSZg6kaE4a4e6nTvizmHkxdC:run";

export const IS_DEV = import.meta.env.MODE === "development";

export const APP_SERVER_URL = IS_DEV
  ? "https://localhost:3000"
  : "https://server.confession-manager.app";

export const BASE_URL = IS_DEV
  ? "https://localhost:8080"
  : "https://confession-manager.app";

export const LOCAL_KEY_CONFESSION_FORM_ID = "confession_form_id";
export const LOCAL_KEY_NOTIFICATION_SUBSCRIBED_SPREADSHEETS =
  "notification_subscribed";
export const LOCAL_KEY_NOTIFICATION_TOKEN = "notification_token";
export const LOCAL_KEY_CACHED_NOTIFICATIONS = "notifications";
export const LOCAL_KEY_PENDING_NOTIFICATIONS = "pending_notifications";

export const NOTIFICATION_TOPIC =
  "projects/confession-manager/topics/confession-notification";

export { default as DEFAULT_AVATAR_URL } from "../assets/images/default-avatar.jpg";
export { default as SETTINGS_ICON_URL } from "../assets/icons/gear-six-icon.svg";
export { default as BELL_ICON_URL } from "../assets/icons/bell-icon.svg";
export { default as LAUNCH_ICON_URL } from "../assets/icons/launch-icon.svg";
export { default as LOGOUT_ICON_URL } from "../assets/icons/sign-out-icon.svg";
export { default as HEART_ICON_URL } from "../assets/icons/heart-icon.svg";
export { default as BUG_ICON_URL } from "../assets/icons/bug-icon.svg";
export { default as HOUSE_ICON_URL } from "../assets/icons/house-icon.svg";
export { default as CHECK_ICON_URL } from "../assets/icons/check-icon.svg";
export { default as CROSS_ICON_URL } from "../assets/icons/cross-icon.svg";
export { default as PAPER_PLANE_ICON_URL } from "../assets/icons/paper-plane-tilt-icon.svg";
export { default as RIGHT_ARROW_ICON_URL } from "../assets/icons/right-arrow-icon.svg";
export { default as APP_LOGO_URL } from "../assets/icons/confession-manager-icon.svg";

export const GOOGLE_SHEET_FAVICON_URL =
  "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x64.png";
export const GOOGLE_FORMS_FAVICON_URL =
  "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_2_form_x64.png";
