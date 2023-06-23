import {
  PENDING_CHANGES_CONFESSION_ARRAY_KEYS
} from "app-constants";
import Confession from "classes/Confesison";
import { MessagePayload } from "firebase/messaging";
import { createSignal } from "solid-js";
import { createMutable, createStore } from "solid-js/store";
import {
  ConfessionSpreadsheetMetadata,
  Confessions,
  FacebookConfessionPageMetadata,
  FacebookPage,
  FacebookUser,
  PendingChanges,
  PostTemplateSettings,
  SheetTypeKeys,
  UserInfo,
} from "types";

export const [isGapiLoaded, setGapiLoaded] = createSignal(false);
export const [isFacebookLoaded, setFacebookLoaded] = createSignal(false);

export const [picker, setPicker] = createSignal<google.picker.Picker | null>(
  null
);

export const [isPicking, setPicking] = createSignal(false);
export const [linkResponsesShow, setLinkResponsesShow] = createSignal<{
  spreadsheetId?: string | null;
  formId?: string | null;
} | null>(null);

export const [scrollY, setScrollY] = createSignal(window.scrollY);

export const [isMessagingTokenRegistered, setMessagingTokenRegistered] =
  createSignal(false);

/// USER STATES
export const [confessionSpreadsheet, setConfessionSpreadsheet] =
  createStore<gapi.client.sheets.Spreadsheet>({});

export const [confesisonForm, setConfessionForm] =
  createStore<gapi.client.forms.Form>({});

export const [confessionMetadata, setConfessionMetadata] =
  createStore<ConfessionSpreadsheetMetadata>({});

export const pendingChanges = createMutable<PendingChanges>({
  accepts: [],
  declines: [],
  cancels: [],
  posts: [],
});

export const resetPendingChanges = () => {
  for (const key of PENDING_CHANGES_CONFESSION_ARRAY_KEYS) {
    pendingChanges[key] = [];
  }
};

export const [loggedIn, setLoggedIn] = createSignal(false);

export const [isSheetInited, setSheetInited] = createSignal(false);

/**
 * 0 - false: Descending
 * 1 - true: Ascending
 */
export const confessions = createMutable<Confessions>({
  pending: [[], []],
  declined: [[], []],
  accepted: [[], []],
  posted: [[], []],
});

export const [pendingNotification, setPendingNotification] = createSignal<
  MessagePayload[]
>([]);

export const sheetsLastRow = createMutable<{
  [key in SheetTypeKeys]?: number;
}>({});

export const [facebookUser, setFacebookUser] = createSignal<
  FacebookUser | null | undefined
>();

export const [accessibleFacebookPages, setAccessibleFacebookPages] =
  createStore<FacebookPage[]>([]);

export const [currentConfessionPage, setCurrentConfessionPage] =
  createSignal<FacebookPage | null>();

export const [confessionPageMetadata, setConfessionPageMetadata] =
  createStore<FacebookConfessionPageMetadata>({
    hashtag: "",
    replyHashtag: "",
  });

export const hiddenConfessionRows = createMutable<{
  hidden: {
    [key: number]: boolean;
  };
}>({ hidden: {} });

export const pendingPost = createMutable<Confession[]>([]);

export const postSettingTemplates = createMutable<PostTemplateSettings[]>([]);

export const [userData, setUserData] = createStore<UserInfo>({});

// EVENTS
window.addEventListener("scroll", () => {
  setScrollY(window.scrollY);
});
