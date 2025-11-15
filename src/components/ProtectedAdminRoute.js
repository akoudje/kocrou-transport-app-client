import React, { useEffect, useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState(false);
  const { checkAdmin } = useContext(AuthContext);

  useEffect(() => {
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
  }, [checkAdmin]);

  if (isValid === null && !error) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>🔄 Vérification admin...</div>;
  }

  if (error || !isValid) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;