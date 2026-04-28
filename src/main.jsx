import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";


function ensureAnonymousUserId() {
  const KEY = "tonecheck_user_id";

  let id = localStorage.getItem(KEY);

  if (!id) {
    id =
      "tc_" +
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 10);

    localStorage.setItem(KEY, id);

    // optional track first-time visitor in Plausible
    if (window.plausible) {
      window.plausible("New User");
    }
  }

  return id;
}

ensureAnonymousUserId();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
