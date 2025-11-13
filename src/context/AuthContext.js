// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Synchronisation locale
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  }, [user, token, refreshToken]);

  // ✅ Appliquer automatiquement le token sur Axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // ✅ Connexion utilisateur
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      setUser(data.user);
      setToken(data.token);
      setRefreshToken(data.refreshToken);

      Swal.fire({
        icon: "success",
        title: "Connexion réussie ✅",
        text: `Bienvenue ${data.user.name}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setError(err.response?.data?.message || "Erreur de connexion.");
      Swal.fire({
        icon: "error",
        title: "Échec de la connexion",
        text: "Identifiants incorrects ou serveur indisponible.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Déconnexion propre
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.clear();
    Swal.fire({
      icon: "info",
      title: "Déconnexion effectuée",
      text: "À bientôt 👋",
      confirmButtonColor: "#2563eb",
    });
  }, []);

  // ✅ Rafraîchissement automatique du token
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return;
    try {
      const { data } = await api.post("/auth/refresh", { refreshToken });
      setToken(data.token);
      localStorage.setItem("token", data.token);
      console.log("♻️ Token régénéré avec succès");
    } catch (error) {
      console.warn("⚠️ Refresh token invalide :", error);
      logout();
    }
  }, [refreshToken, logout]);

  // 🔄 Vérifie périodiquement la validité du token
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 1000 * 60 * 5); // toutes les 5 minutes
    return () => clearInterval(interval);
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
