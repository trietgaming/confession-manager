import {
  LOCAL_KEY_CACHED_NOTIFICATIONS,
  PENDING_CHANGES_CONFESSION_ARRAY_KEYS,
} from "app-constants";
import { MessagePayload, NotificationPayload } from "firebase/messaging";
import { userResourceDatabase } from "local-database";
import { createSignal } from "solid-js";
import { createMutable, createStore } from "solid-js/store";
import {
  ConfessionSpreadsheetMetadata,
  Confessions,
  PendingChanges,
  SheetTypeKeys,
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
});

export const [pendingNotification, setPendingNotification] = createSignal<
  MessagePayload[]
>([]);

export const sheetsLastRow = createMutable<{
  [key in SheetTypeKeys]?: number;
}>({});

// EVENTS
window.addEventListener("scroll", () => {
  setScrollY(window.scrollY);
});
