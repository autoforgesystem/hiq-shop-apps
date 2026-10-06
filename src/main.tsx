import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";
import { captureUtms } from "./lib/analytics";
import { loadCatalog } from "./data/catalogStore";

captureUtms();
// The catalogue (products, filters, photos) comes from the catalog store, so load it before the first render.
loadCatalog().catch((e) => console.error("Catalogue failed to load; showing the built-in catalogue.", e)).finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter><App /></BrowserRouter>
    </React.StrictMode>,
  );
});
