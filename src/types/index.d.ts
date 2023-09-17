/// <reference types="vite/client" />
import Confession from "models/Confession";
import Color from "models/Color";
import ConditionalFilteringModal from "../pages/_Init/InitSheets/ConditionalFilteringModal";
import FreshStartModal from "../pages/_Init/InitSheets/FreshStartModal";

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export interface ConfessionSpreadsheetMetadata {
  acceptedSheet?: gapi.client.sheets.Sheet;
  declinedSheet?: gapi.client.sheets.Sheet;
  postedSheet?: gapi.client.sheets.Sheet;
  pendingSheet?: gapi.client.sheets.Sheet;
  archivedSheet?: gapi.client.sheets.Sheet;
  postSettingTemplatesSheet?: gapi.client.sheets.Sheet;
  inited?: boolean;
}

export interface PendingChanges {
  accepts?: Confession[];
  declines?: Confession[];
  cancels?: Confession[];
  posts?: Confession[];
}

export type HandleAction = (
  actionType: `${keyof PendingChanges}`,
  confession: Confession
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
    "inited" | "archivedSheet" | "pendingSheet" | "postSettingTemplatesSheet"
  >;
  title: string;
};

export type SheetTypeKeys = keyof Omit<
  ConfessionSpreadsheetMetadata,
  "inited" | "archivedSheet" | "postSettingTemplatesSheet"
>;
export type SelectedObject = Record<SheetTypeKeys, number | null>;

export type PreviewSheetKeys =
  | keyof ConfessionSpreadsheetGridData["selected"]
  | "pendingSheet";

export interface UserInfo {
  photoUrl?: string;
  displayName?: string;
  email?: string;
}

export interface VerticalNavBarMetadata {
  iconUrl: string;
  path: string;
  title: string;
}

type ConfessionsMap = [descending: Confession[], ascending: Confession[]];

export interface Confessions {
  pending: ConfessionsMap;
  declined: ConfessionsMap;
  accepted: ConfessionsMap;
  posted: ConfessionsMap;
}

export interface PushMessageData {
  eventType: string;
  spreadsheetId: string;
  range: string;
  /**
   * JSON string array
   */
  values: string;
  publishTime: string;
}

export type ActionButtonMetadata = {
  key: keyof PendingChanges | "post";
  title: string;
};

export interface FacebookUser {
  id: string;
  name: string;
}

export interface FacebookPage {
  access_token: string;
  id: string;
  name: string;
  tasks: string[];
  pictureUrl?: string;
}

export interface FacebookConfessionPageMetadata {
  hashtag: string;
  replyHashtag: string;
  lastestConfessionNumber?: number;
}

export interface PostTemplateSettings {
  _name?: string;
  _row?: number;
  header?: string;
  footer?: string;
  embed?: string;
  dividerEnabled?: boolean;
  divider?: string;
  formLinkEnabled?: boolean;
  formLinkAtFooterDisabled?: boolean;
  formLinkTitle?: string;
  showTimestamp?: boolean;
  showTime?: boolean;
  showDate?: boolean;
}

export interface PostingData {
  isPosting: boolean;
  newPostLink: string;
}
