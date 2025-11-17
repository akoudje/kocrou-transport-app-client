import React, { useEffect, useState, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { AuthContext } from "../../context/AuthContext";
import smartApi from "../../utils/smartApi";
import usePing from "../../hooks/usePing";
const AdminLayout = () => {
  const { checkAdmin } = useContext(AuthContext);
  const [isValid, setIsValid] = useState(null);
  const navigate = useNavigate();
  const serverUp = usePing();
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) smartApi.setAuthHeader(token);

    if (!serverUp) return; // ⛔ Ne lance pas checkAdmin si le serveur est KO

    const verify = async () => {
      const result = await checkAdmin();
      if (!result) navigate("/admin-login");
      else setIsValid(true);
    };
    verify();
  }, [checkAdmin, navigate]);
  if (!serverUp) {
    return (
      <div className="p-10 text-center text-red-500">
        ❌ Le serveur est temporairement injoignable. Veuillez réessayer plus
        tard.
      </div>
    );
  }
  if (!isValid) {
    return (
      <div className="p-10 text-center text-gray-500">
        🔒 Vérification des droits admin...
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Tableau de bord" />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
