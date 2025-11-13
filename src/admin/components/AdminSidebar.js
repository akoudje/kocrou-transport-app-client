import React, { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bus,
  CalendarDays,
  Users,
  LogOut,
  Settings,
  Activity,
  Bell,
  BarChart2,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import { SettingsContext } from "../../context/SettingsContext"; // 👈 Ajout

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { settings } = useContext(SettingsContext); // 👈 Récupération des settings globaux

  // États dynamiques
  const [adminCount, setAdminCount] = useState(0);
  const [activeReservations, setActiveReservations] = useState(0);
  const [trajetCount, setTrajetCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [liveChange, setLiveChange] = useState({ field: "", delta: 0 });

  useEffect(() => {
    const socket = io(
      process.env.REACT_APP_API_BASE_URL || "https://kocrou-transport-app-server.onrender.com",
      { transports: ["websocket"] }
    );

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("admin_join", { email: "sidebar-monitor@admin" });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("monitoring_update", (data) => {
      if (data.adminCount !== undefined) setAdminCount(data.adminCount);
    });

    socket.on("reservation_created", () => fetchAllCounts());
    socket.on("reservation_deleted", () => fetchAllCounts());

    fetchAllCounts();
    return () => socket.disconnect();
  }, []);

  const fetchAllCounts = async () => {
    try {
      const [trajetsRes, reservationsRes, usersRes] = await Promise.all([
        api.get("/trajets"),
        api.get("/reservations/admin/reservations?statut=confirmée&all=true"),
        api.get("/users"),
      ]);

      const newTrajetCount = trajetsRes.data?.data?.length || 0;
      const confirmedReservations = reservationsRes.data?.data || [];
      const newActiveReservations = confirmedReservations.length;
      const allUsers =
        usersRes.data?.data || (Array.isArray(usersRes.data) ? usersRes.data : []);
      const newUserCount = allUsers.length;

      if (newTrajetCount !== trajetCount)
        triggerLiveChange("trajets", newTrajetCount - trajetCount);
      if (newActiveReservations !== activeReservations)
        triggerLiveChange("reservations", newActiveReservations - activeReservations);
      if (newUserCount !== userCount)
        triggerLiveChange("users", newUserCount - userCount);

      setTrajetCount(newTrajetCount);
      setActiveReservations(newActiveReservations);
      setUserCount(newUserCount);
    } catch (err) {
      console.error("Erreur lors du chargement des compteurs :", err);
    }
  };

  const triggerLiveChange = (field, delta) => {
    if (delta === 0) return;
    setLiveChange({ field, delta });
    setTimeout(() => setLiveChange({ field: "", delta: 0 }), 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: "/admin" },
    { name: "Trajets", icon: <Bus className="w-4 h-4" />, path: "/admin/trajets", badge: trajetCount, key: "trajets" },
    { name: "Réservations", icon: <CalendarDays className="w-4 h-4" />, path: "/admin/reservations", badge: activeReservations, key: "reservations" },
    { name: "Utilisateurs", icon: <Users className="w-4 h-4" />, path: "/admin/utilisateurs", badge: userCount, key: "users" },
    { name: "Notifications", icon: <Bell className="w-4 h-4" />, path: "/admin/notifications" },
    { name: "Rapports", icon: <BarChart2 className="w-4 h-4" />, path: "/admin/reports" },
    { name: "Logs", icon: <ClipboardList className="w-4 h-4" />, path: "/admin/logs" },
    { name: "Historique d’activité", icon: <Activity className="w-5 h-5" />, path: "/admin/activity" },
    { name: "Paramètres", icon: <Settings className="w-4 h-4" />, path: "/admin/settings" },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-64 shadow-lg min-h-screen p-5 relative overflow-hidden"
      style={{
        backgroundColor: "#fff",
        borderRight: `4px solid ${settings?.couleurPrincipale || "#2563eb"}`,
      }}
    >
      {/* 🧭 En-tête dynamique */}
      <div className="mb-10 flex items-center gap-2 text-2xl font-bold tracking-tight">
        {settings?.logo ? (
          <img src={settings.logo} alt="Logo" className="w-10 h-10 object-contain" />
        ) : (
          <span>🚍</span>
        )}
        <span style={{ color: settings?.couleurPrincipale || "#2563eb" }}>
          {settings?.compagnieName || "Kocrou Admin"}
        </span>
      </div>

      {/* 📚 Menu principal */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center justify-between px-4 py-2 rounded-lg font-medium transition ${
                isActive
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`
            }
            style={{
              backgroundColor: isActive
                ? settings?.couleurPrincipale || "#2563eb"
                : "transparent",
            }}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.name}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* ⚙️ Pied de sidebar */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span
            className={`w-3 h-3 rounded-full ${
              socketConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></span>
          <span className="text-gray-500 dark:text-gray-400">
            {socketConnected ? "Connecté" : "Déconnecté"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 transition w-full"
        >
          <LogOut className="w-5 h-5" /> Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
