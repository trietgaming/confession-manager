import { checkSheetInited } from "methods/checkSheetInited";
import { createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { ConfessionSpreadsheetMetadata, PendingChanges } from "types";

export const [picker, setPicker] = createSignal<google.picker.Picker | null>(
  null
);

export const [loggedIn, setLoggedIn] = createSignal(false);

export const [scrollY, setScrollY] = createSignal(window.scrollY);

/// STORES
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

export const [isGapiLoaded, setGapiLoaded] = createSignal(false);

export const [isPicking, setPicking] = createSignal(false);

export const [isSheetInited, setSheetInited] = createSignal(false);

window.addEventListener("scroll", () => {
  setScrollY(window.scrollY);
});
