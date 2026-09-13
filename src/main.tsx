import React from "react";
import ReactDOM from "react-dom/client";
import { SqlApp } from "./SqlApp";
import { AppErrorBoundary } from "./AppErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <SqlApp />
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
