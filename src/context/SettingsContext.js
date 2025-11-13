// client/src/context/SettingsContext.js
import React, { createContext, useEffect, useState } from "react";
import api from "../utils/api";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     🧩 1️⃣ Fonction principale de récupération
     ========================================================= */
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/settings");
      const settingsData = data?.data || data;

      if (!settingsData) throw new Error("Aucun paramètre système trouvé.");

      setSettings(settingsData);
      applyTheme(settingsData);
      console.log("✅ Paramètres système chargés :", settingsData);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des paramètres :", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     🎨 2️⃣ Application dynamique du thème
     ========================================================= */
  const applyTheme = (data) => {
    if (!data) return;
    const root = document.documentElement;

    // 🎨 Couleur principale
    if (data.couleurPrincipale) {
      root.style.setProperty("--color-primary", data.couleurPrincipale);
      root.style.setProperty(
        "--color-primary-hover",
        darkenColor(data.couleurPrincipale, 0.15)
      );
    }

    // 🖼️ Logo dynamique
    if (data.logo) {
      localStorage.setItem("app_logo", data.logo);
    }
  };

  /* =========================================================
     🌈 3️⃣ Fonction utilitaire : assombrir une couleur
     ========================================================= */
  const darkenColor = (hex, amount = 0.2) => {
    try {
      const num = parseInt(hex.replace("#", ""), 16);
      const r = Math.max(0, ((num >> 16) & 255) * (1 - amount));
      const g = Math.max(0, ((num >> 8) & 255) * (1 - amount));
      const b = Math.max(0, (num & 255) * (1 - amount));
      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return hex;
    }
  };

  /* =========================================================
     🕓 4️⃣ Chargement initial + rafraîchissement périodique
     ========================================================= */
  useEffect(() => {
    fetchSettings(); // 🔹 Au montage
  }, []);

  // 🔁 Rafraîchissement automatique toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(fetchSettings, 60000);
    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     ⚙️ 5️⃣ Fournir le contexte global
     ========================================================= */
  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        fetchSettings,
        setSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
