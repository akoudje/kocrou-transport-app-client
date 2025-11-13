import React, { useEffect, useState, useRef } from "react";
import { Card, Table, Tag, message } from "antd";
import { io } from "socket.io-client";
import api from "../../utils/api";
import dayjs from "dayjs";
import { Activity, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";

const AdminLiveMonitor = () => {
  const [admins, setAdmins] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [connectedCount, setConnectedCount] = useState(0);

  // 🔹 Données du graphique (max 15 points)
  const [activityData, setActivityData] = useState([]);
  const dataRef = useRef([]);

  useEffect(() => {
    const socket = io(
      process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
      { transports: ["websocket"] }
    );

    socket.emit("admin_join", { email: "monitoring@kocrou" });

    socket.on("monitoring_update", (data) => {
      if (data.admins) setAdmins(data.admins);
      if (data.adminCount !== undefined) {
        setConnectedCount(data.adminCount);
        updateChart(data.adminCount, reservations.length);
      }
    });

    socket.on("reservation_created", (data) => {
      message.success(
        `🚍 Réservation créée (${data.trajet?.villeDepart} → ${data.trajet?.villeArrivee})`
      );
      fetchReservations();
    });

    socket.on("reservation_deleted", () => {
      message.info(`❌ Réservation annulée`);
      fetchReservations();
    });

    const pingInterval = setInterval(() => {
      socket.emit("admin_ping", { email: "monitoring@kocrou" });
    }, 15000);

    fetchMonitoringSnapshot();

    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
    };
  }, []);

  // 📊 Fonction : Mise à jour du graphique
  const updateChart = (adminCount, reservationCount) => {
    const timestamp = dayjs().format("HH:mm:ss");
    const newPoint = { time: timestamp, admins: adminCount, reservations: reservationCount };

    dataRef.current = [...dataRef.current, newPoint].slice(-15); // max 15 points
    setActivityData([...dataRef.current]);
  };

  // 🔍 Charger snapshot global
  const fetchMonitoringSnapshot = async () => {
    try {
      const { data } = await api.get("/monitoring");
      if (data.success) {
        setAdmins(data.admins || []);
        setReservations(data.recentReservations || []);
        setConnectedCount(data.connectedAdmins || 0);
        updateChart(data.connectedAdmins || 0, data.recentReservations?.length || 0);
      }
    } catch (err) {
      console.error("Erreur chargement monitoring :", err);
    }
  };

  // 🔍 Charger les réservations récentes
  const fetchReservations = async () => {
    try {
      const { data } = await api.get("/reservations/admin/reservations?limit=5");
      setReservations(data.data || []);
      updateChart(connectedCount, data.data?.length || 0);
    } catch (err) {
      console.error("Erreur chargement réservations :", err);
    }
  };

  // 🧩 Colonnes Admins
  const adminColumns = [
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Dernière activité",
      dataIndex: "lastActive",
      render: (text) =>
        text ? dayjs(text).format("DD/MM/YYYY HH:mm:ss") : "—",
    },
    {
      title: "Statut",
      render: () => (
        <Tag color="green" className="font-semibold">
          🟢 En ligne
        </Tag>
      ),
    },
  ];

  // 🧾 Colonnes Réservations
  const reservationColumns = [
    { title: "Client", dataIndex: ["user", "email"], key: "user" },
    {
      title: "Trajet",
      render: (r) =>
        `${r.trajet?.villeDepart} → ${r.trajet?.villeArrivee || "-"}`,
    },
    {
      title: "Compagnie",
      dataIndex: ["trajet", "compagnie"],
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (t) => dayjs(t).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <Activity className="text-green-500 w-6 h-6" /> Monitoring en direct
      </h2>

      {/* 🔹 Aperçu Graphique Temps Réel */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Activité en temps réel
          </div>
        }
        className="shadow-md"
      >
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
              formatter={(value, name) =>
                name === "admins"
                  ? [`${value}`, "👑 Admins"]
                  : [`${value}`, "🚌 Réservations"]
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="admins"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="reservations"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 🔹 Section Admins connectés */}
      <Card
        title={`Administrateurs connectés (${connectedCount})`}
        bordered
        className="shadow-md"
      >
        <Table
          columns={adminColumns}
          dataSource={admins}
          rowKey="email"
          pagination={false}
        />
      </Card>

      {/* 🔹 Section dernières réservations */}
      <Card title="Dernières réservations" bordered className="shadow-md">
        <Table
          columns={reservationColumns}
          dataSource={reservations}
          rowKey="_id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AdminLiveMonitor;
