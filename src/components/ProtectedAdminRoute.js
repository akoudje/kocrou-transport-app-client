import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedAdminRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return setIsValid(false);

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/auth/user`, {
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
};

export default ProtectedAdminRoute;