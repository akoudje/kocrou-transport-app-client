// client/src/context/SettingsContext.js
import React, { createContext, useEffect, useState } from "react";
import api from "../utils/api";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Charger les paramètres depuis le serveur
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/settings");
      setSettings(data);
      document.documentElement.style.setProperty("--color-primary", data.couleurPrincipale);
    } catch (err) {
      console.error("Erreur chargement settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⚙️ Mettre à jour le contexte manuellement
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    if (newSettings?.couleurPrincipale) {
      document.documentElement.style.setProperty("--color-primary", newSettings.couleurPrincipale);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        fetchSettings,
        updateSettings, // 👈 exposé pour rafraîchir sans rechargement
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
