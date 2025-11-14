// client/src/routes/ProtectedAdminRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import smartApi from "../utils/smartApi"; // ✅ Utilisation du wrapper

/* const ProtectedAdminRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return setIsValid(false);

    smartApi
      .get("/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((res) => {
        if (res.data?.isAdmin) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      })
      .catch(() => setIsValid(false));
  }, []);

  if (isValid === null) return null; // ou spinner
  if (!isValid) return <Navigate to="/admin-login" replace />;
  return children;
}; */


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