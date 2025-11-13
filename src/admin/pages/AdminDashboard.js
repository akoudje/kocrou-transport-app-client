import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, Bus, DollarSign, Calendar, Clock, Wifi } from "lucide-react";
import { message, Tag } from "antd";
import api from "../../utils/api";
import socket from "../../utils/socket";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    trajets: 0,
    reservations: 0,
    revenue: 0,
  });
  const [reservationsByMonth, setReservationsByMonth] = useState([]);
  const [reservationsLast7Days, setReservationsLast7Days] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const refreshIntervalRef = useRef(null);
  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const token = localStorage.getItem("token");

  // ======================================================
  // 📊 Chargement des statistiques globales
  // ======================================================
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, trajetsRes, reservationsRes] = await Promise.all([
        api.get("/users", { headers }),
        api.get("/trajets", { headers }),
        api.get("/reservations/admin/reservations?all=true", { headers }),
      ]);

      const allUsers = usersRes.data?.data || [];
      const allTrajets = trajetsRes.data?.data || [];
      const allReservations = reservationsRes.data?.data || [];

      const users = allUsers.length;
      const trajets = allTrajets.length;
      const reservations = allReservations.length;
      const revenue = allReservations.reduce(
        (sum, r) => sum + (r.trajet?.prix || 0),
        0
      );

      const monthly = {};
      allReservations.forEach((r) => {
        const month = new Date(r.dateReservation).toLocaleString("fr-FR", {
          month: "short",
        });
        monthly[month] = (monthly[month] || 0) + 1;
      });

      const daily = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        const label = day.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        });
        daily[label] = 0;
      }
      allReservations.forEach((r) => {
        const label = new Date(r.dateReservation).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        });
        if (daily[label] !== undefined) daily[label] += 1;
      });

      const destinations = {};
      allReservations.forEach((r) => {
        const dest = r.trajet?.villeArrivee || "Inconnue";
        destinations[dest] = (destinations[dest] || 0) + 1;
      });

      setStats({ users, trajets, reservations, revenue });
      setReservationsByMonth(
        Object.entries(monthly).map(([mois, total]) => ({ mois, total }))
      );
      setReservationsLast7Days(
        Object.entries(daily).map(([jour, total]) => ({ jour, total }))
      );
      setTopDestinations(
        Object.entries(destinations)
          .map(([ville, total]) => ({ ville, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
      );
      setLastUpdated(new Date());
    } catch (err) {
      console.error("❌ Erreur dashboard:", err);
      message.error("Erreur lors du chargement du dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ======================================================
  // ⚡ Connexion WebSocket sécurisée
  // ======================================================
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("admin_join");
    });

    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("reservation_created", (data) => {
      message.success({
        content: `+1 réservation ajoutée pour ${data.trajet?.villeDepart} → ${data.trajet?.villeArrivee}`,
        duration: 2.5,
      });
      fetchDashboardData();
    });

    socket.on("reservation_deleted", (data) => {
      message.warning({
        content: `Réservation supprimée pour ${data.trajet?.villeDepart} → ${data.trajet?.villeArrivee}`,
        duration: 2.5,
      });
      fetchDashboardData();
    });

    fetchDashboardData();

    refreshIntervalRef.current = setInterval(fetchDashboardData, 60000);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reservation_created");
      socket.off("reservation_deleted");
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [fetchDashboardData]);

  // ======================================================
  // ⏱ Dernière mise à jour
  // ======================================================
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return "—";
    const diff = Math.floor((new Date() - lastUpdated) / 1000);
    if (diff < 60) return `il y a ${diff}s`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)} h`;
  };

  // ======================================================
  // 🎨 Affichage principal
  // ======================================================
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Chargement des statistiques...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-10">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Wifi
              className={`w-4 h-4 ${
                socketConnected ? "text-green-500" : "text-red-500"
              }`}
            />
            <Tag color={socketConnected ? "green" : "red"} style={{ borderRadius: 10 }}>
              {socketConnected ? "Connecté au temps réel" : "Déconnecté"}
            </Tag>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Dernière mise à jour : {getTimeSinceUpdate()}
          </div>
        </div>

        <DashboardCharts
          stats={stats}
          reservationsByMonth={reservationsByMonth}
          reservationsLast7Days={reservationsLast7Days}
          topDestinations={topDestinations}
          COLORS={COLORS}
        />
      </div>
    </div>
  );
};

// ======================================================
// 🧩 COMPOSANTS SECONDAIRES
// ======================================================
const DashboardCharts = ({ stats, reservationsByMonth, reservationsLast7Days, topDestinations, COLORS }) => (
  <>
    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Utilisateurs" value={stats.users} icon={<Users />} />
      <StatCard title="Trajets" value={stats.trajets} icon={<Bus />} />
      <StatCard title="Réservations" value={stats.reservations} icon={<Calendar />} />
      <StatCard title="Revenus" value={`${stats.revenue.toLocaleString()} FCFA`} icon={<DollarSign />} />
    </div>

    {/* Graphiques */}
    <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Réservations par mois</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={reservationsByMonth}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Réservations quotidiennes (7 derniers jours)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={reservationsLast7Days}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="jour" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Top 5 destinations</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={topDestinations} dataKey="total" nameKey="ville" outerRadius={100} label>
            {topDestinations.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </>
);

const StatCard = ({ title, value, icon }) => (
  <div className="p-5 bg-white dark:bg-card-dark rounded-xl shadow flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">{value}</h2>
    </div>
    {icon}
  </div>
);

export default AdminDashboard;
