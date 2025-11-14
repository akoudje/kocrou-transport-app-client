// src/admin/components/AdminSidebar.js
import React, { useEffect, useState } from "react";
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

const AdminSidebar = () => {
  const navigate = useNavigate();

  const [adminCount, setAdminCount] = useState(0);
  const [activeReservations, setActiveReservations] = useState(0);
  const [trajetCount, setTrajetCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [liveChange, setLiveChange] = useState({ field: "", delta: 0 });

  // ⚡ Connexion Socket.io avec AUTH TOKEN
  useEffect(() => {
    const token = localStorage.getItem("token");

    const socket = io(api.defaults.baseURL, {
      transports: ["websocket"],
      auth: { token }, // ✅ on envoie le token JWT ici
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("🟢 Socket connecté avec auth JWT");
      socket.emit("admin_join", { email: "sidebar-monitor@admin" });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      console.warn("🔴 Socket déconnecté");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Erreur connexion Socket.io :", err.message);
    });

    socket.on("monitoring_update", (data) => {
      if (data.adminCount !== undefined) setAdminCount(data.adminCount);
    });

    socket.on("reservation_created", () => fetchAllCounts());
    socket.on("reservation_deleted", () => fetchAllCounts());

    fetchAllCounts();

    return () => socket.disconnect();
  }, []);

  // 🔄 Chargement des compteurs
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
        usersRes.data?.data ||
        (Array.isArray(usersRes.data) ? usersRes.data : []);
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

  // 🔔 Animation live
  const triggerLiveChange = (field, delta) => {
    if (delta === 0) return;
    setLiveChange({ field, delta });
    setTimeout(() => setLiveChange({ field: "", delta: 0 }), 1500);
  };

  // 🔓 Déconnexion
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
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-card-dark shadow-lg min-h-screen p-5 relative overflow-hidden">
      <div className="text-2xl font-bold text-primary mb-10 tracking-tight">
        🚍 Kocrou Admin
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
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.name}</span>
            </div>

            {/* ✅ Badge dynamique */}
            {item.badge !== undefined && item.name !== "Dashboard" && (
              <div className="relative">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.badge > 0
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {item.badge}
                </span>

                <AnimatePresence>
                  {liveChange.field === item.key && liveChange.delta !== 0 && (
                    <motion.span
                      key={`${item.key}-${liveChange.delta}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: -10 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.8 }}
                      className={`absolute right-0 text-xs font-bold ${
                        liveChange.delta > 0 ? "text-green-500" : "text-red-500"
                      }`}
                      style={{ top: "-1rem", right: "0.2rem" }}
                    >
                      {liveChange.delta > 0
                        ? `+${liveChange.delta}`
                        : liveChange.delta}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </NavLink>
        ))}

        {/* 🟢 Monitoring Live */}
        <NavLink
          to="/admin/live-monitor"
          className={({ isActive }) =>
            `flex items-center justify-between px-4 py-2 rounded-lg font-medium transition ${
              isActive
                ? "bg-primary text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <div className="flex items-center gap-2">
            <Activity
              className={`w-4 h-4 ${
                adminCount > 0 ? "text-green-500 animate-pulse" : "text-gray-400"
              }`}
            />
            <span>Monitoring Live</span>
          </div>
          {adminCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
              {adminCount}
            </span>
          )}
        </NavLink>
      </nav>

      {/* ⚙️ Pied de sidebar */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`w-3 h-3 rounded-full ${
                socketConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></span>
            <span className="text-gray-500 dark:text-gray-400">
              {socketConnected ? "Connecté au temps réel" : "Déconnecté"}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 transition w-full"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>

        <div className="mt-3 flex items-center gap-2 text-gray-400 text-sm">
          <Settings className="w-4 h-4" />
          Version 1.0.0
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
