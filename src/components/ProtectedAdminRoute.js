import React, { useEffect, useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import usePing from "../hooks/usePing";
import smartApi from "../utils/smartApi";

const ProtectedAdminRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState(false);
  const { checkAdmin } = useContext(AuthContext);
  const serverUp = usePing();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) smartApi.setAuthHeader(token);

    if (!serverUp) return; // ⛔ Ne lance pas checkAdmin si le serveur est KO

    let isMounted = true;

    const verify = async () => {
      try {
        const result = await checkAdmin();
        if (isMounted) setIsValid(result);
      } catch (err) {
        console.warn("🔒 Erreur dans ProtectedAdminRoute :", err);
        if (isMounted) {
          setError(true);
          setIsValid(false);
        }
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [checkAdmin, serverUp]);

  if (!serverUp) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
        ❌ Le serveur est temporairement injoignable. Veuillez réessayer plus
        tard.
      </div>
    );
  }

  if (isValid === null && !error) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        🔄 Vérification admin...
      </div>
    );
  }

  if (error || !isValid) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
