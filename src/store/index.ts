import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { ConfessionSpreadsheetMetadata, PendingChanges } from "types";

export const [picker, setPicker] = createSignal<google.picker.Picker | null>(
  null
);
export const [tokenClient, setTokenClient] =
  createSignal<google.accounts.oauth2.TokenClient | null>(null);
export const [confessionSpreadsheet, setConfessionSpreadsheet] =
  createSignal<gapi.client.sheets.Spreadsheet | null>(null);
export const [loggedIn, setLoggedIn] = createSignal(false);

export const [scrollY, setScrollY] = createSignal(window.scrollY);
export const [confessionMetadata, setConfessionMetadata] =
  createSignal<ConfessionSpreadsheetMetadata | null>(null);

export const [pendingChanges, setPendingChanges] = createStore<PendingChanges>({
  accepts: [],
  declines: [],
  post: [],
});
window.addEventListener("scroll", () => {
  setScrollY(window.scrollY);
});
