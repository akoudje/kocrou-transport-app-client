// client/src/routes/ProtectedAdminRoute.js
import React, { useEffect, useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // ✅ Ajouté
import smartApi from "../utils/smartApi";

const ProtectedAdminRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const { checkAdmin } = useContext(AuthContext);

  useEffect(() => {
    const verify = async () => {
      const result = await checkAdmin();
      setIsValid(result);
    };
    verify();
  }, [checkAdmin]);

  if (isValid === null) return null; // ou spinner
  if (!isValid) return <Navigate to="/admin-login" replace />;
  return children;
};

export default ProtectedAdminRoute;