import { LOCAL_KEY_CACHED_NOTIFICATIONS } from "app-constants";
import { MessagePayload, NotificationPayload } from "firebase/messaging";
import { userResourceDatabase } from "local-database";
import { createSignal } from "solid-js";
import { createMutable, createStore } from "solid-js/store";
import {
  ConfessionSpreadsheetMetadata,
  Confessions,
  PendingChanges,
} from "types";

export const [isGapiLoaded, setGapiLoaded] = createSignal(false);

export const [picker, setPicker] = createSignal<google.picker.Picker | null>(
  null
);

export const [isPicking, setPicking] = createSignal(false);

export const [scrollY, setScrollY] = createSignal(window.scrollY);

/// USER STATES
export const [confessionSpreadsheet, setConfessionSpreadsheet] =
  createStore<gapi.client.sheets.Spreadsheet>({});

export const [confesisonForm, setConfessionForm] =
  createStore<gapi.client.forms.Form>({});

export const [confessionMetadata, setConfessionMetadata] =
  createStore<ConfessionSpreadsheetMetadata>({});

export const [pendingChanges, setPendingChanges] = createStore<PendingChanges>({
  accepts: [],
  declines: [],
  post: [],
});

export const [loggedIn, setLoggedIn] = createSignal(false);

export const [isSheetInited, setSheetInited] = createSignal(false);

export const confessions = createMutable<Confessions>({
  pending: [],
  declined: [],
  accepted: [],
  posted: [],
});

export const [pendingNotification, setPendingNotification] = createSignal<
  MessagePayload[]
>([]);

// EVENTS
window.addEventListener("scroll", () => {
  setScrollY(window.scrollY);
});
