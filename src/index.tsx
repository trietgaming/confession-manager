/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");

//TODO: type check all request to server
//TODO: Make all tailwind classes static (declare a class constant)
// TODO: Handle the auth flow and the picker service. Bug: If auth process took shorter than the picker.load
// then "google" is not defined
// TODO: Update pending changes via some methods
// TODO: SUPPORT confessions that have more than 1 answer column
// TODO: Make UI Responsive
//TODO: Add sort by time in confession view

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  root!
);
