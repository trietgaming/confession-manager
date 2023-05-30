/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");

// T//O//D//O: Clear out the flow of service worker (register issue - checkout index.html)
//TODO: type check all request to server
//TODO: Make all tailwind classes static (declare a class constant)

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  root!
);
