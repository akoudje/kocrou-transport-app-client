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

  if (!serverUp) {
    return (
      <div className="p-10 text-center text-red-500">
        ❌ Le serveur est temporairement injoignable. Veuillez réessayer plus
        tard.
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
