// client/src/context/SettingsContext.js
import React, { createContext, useEffect, useState } from "react";
import smartApi from "../utils/smartApi";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false); // 🎨 Nouvelle bannière

  // ===============================
  // 1️⃣ Chargement initial
  // ===============================
  const fetchSettings = async (silent = false) => {
    try {
      setLoading(true);
      const { data } = await smartApi.get("/settings");
      const settingsData = data?.data || data;

      if (!settingsData) throw new Error("Aucun paramètre système trouvé.");

      // Comparer avec les précédents
      const previousColor = settings?.couleurPrincipale;
      const previousLogo = settings?.logo;

      setSettings(settingsData);
      applyTheme(settingsData);

      // 🎨 Affiche la bannière uniquement si changement visuel
      if (!silent && (previousColor !== settingsData.couleurPrincipale || previousLogo !== settingsData.logo)) {
        triggerBanner();
      }

      console.log("✅ Paramètres système chargés :", settingsData);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des paramètres :", err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 2️⃣ Application dynamique du thème
  // ===============================
  const applyTheme = (data) => {
    if (!data) return;
    const root = document.documentElement;

    if (data.couleurPrincipale) {
      root.style.setProperty("--color-primary", data.couleurPrincipale);
      root.style.setProperty("--color-primary-hover", darkenColor(data.couleurPrincipale, 0.15));
    }

    if (data.logo) {
      localStorage.setItem("app_logo", data.logo);
    }
  };

  // ===============================
  // 3️⃣ Assombrir une couleur
  // ===============================
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

  // ===============================
  // 4️⃣ Rafraîchissement
  // ===============================
  useEffect(() => {
    fetchSettings(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => fetchSettings(true), 60000);
    return () => clearInterval(interval);
  }, []);

  // ===============================
  // 5️⃣ Bannière visuelle
  // ===============================
  const triggerBanner = () => {
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 2500);
  };

  // ===============================
  // 6️⃣ Rendu du provider
  // ===============================
  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings, setSettings }}>
      {children}

      {/* 🎨 Bannière flottante */}
      {showBanner && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-2 rounded-lg shadow-lg animate-fade-in-down">
          🎨 Thème mis à jour !
        </div>
      )}
    </SettingsContext.Provider>
  );
};
