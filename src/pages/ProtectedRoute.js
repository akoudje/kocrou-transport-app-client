import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, checkUser } = useContext(AuthContext);
  const location = useLocation();
  const [isValid, setIsValid] = useState(user ? true : null);

  useEffect(() => {
    if (!user) {
      const verify = async () => {
        const result = await checkUser();
        setIsValid(result);
      };
      verify();
    }
  }, [user, checkUser]);

  if (isValid === null) return null; // ou un spinner
  if (!isValid) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;