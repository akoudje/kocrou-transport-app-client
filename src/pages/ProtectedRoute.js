import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * 🔒 ProtectedRoute
 * - Vérifie si un utilisateur est connecté (via AuthContext)
 * - Si non, redirige vers /login
 * - Si oui, rend le composant enfant (page protégée)
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Si aucun utilisateur connecté → redirection vers /login
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }} // pour revenir à la page initiale après connexion
      />
    );
  }

  // ✅ Utilisateur connecté → on affiche la page protégée
  return children;
};

export default ProtectedRoute;
