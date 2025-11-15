import React, { useEffect, useState, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { AuthContext } from "../context/AuthContext";

const AdminLayout = () => {
  const { checkAdmin } = useContext(AuthContext);
  const [isValid, setIsValid] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      try {
        const result = await checkAdmin();
        if (isMounted) {
          if (!result) navigate("/admin-login");
          else setIsValid(true);
        }
      } catch (err) {
        console.warn("❌ Erreur dans AdminLayout :", err);
        if (isMounted) navigate("/admin-login");
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [checkAdmin, navigate]);

  if (!isValid) {
    return <div className="p-10 text-center text-gray-500">🔒 Vérification des droits admin...</div>;
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