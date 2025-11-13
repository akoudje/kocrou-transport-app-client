import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* 🧭 Barre latérale */}
      <AdminSidebar />

      {/* 🧱 Contenu principal */}
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Tableau de bord" />
        {/* Contenu dynamique (AdminDashboard, AdminUsers...) */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
