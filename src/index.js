import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";

// ✅ C’est ici qu’on englobe toute l’application
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SettingsProvider>
  </React.StrictMode>
);

// Patch pour éviter le warning ResizeObserver dans Chrome
if (typeof window !== "undefined" && "ResizeObserver" in window) {
  const resizeObserverErr = window.ResizeObserver;
  window.ResizeObserver = class extends resizeObserverErr {
    constructor(callback) {
      super((entries, observer) => {
        try {
          callback(entries, observer);
        } catch (err) {
          console.warn("⚠️ ResizeObserver error ignoré :", err);
        }
      });
    }
  };
}


