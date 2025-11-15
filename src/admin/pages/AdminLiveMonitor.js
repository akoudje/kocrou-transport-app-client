import React, { useEffect, useState, useRef } from "react";
import { Card, Table, Tag, message } from "antd";
import { io } from "socket.io-client";
import smartApi from "../../utils/smartApi";
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
  const [activityData, setActivityData] = useState([]);
  const dataRef = useRef([]);
  const token = localStorage.getItem("admintoken");

  useEffect(() => {
    const socket = io(smartApi.defaults.baseURL, {
      transports: ["websocket"],
      auth: { token }, // ✅ envoi du JWT ici
    });

    socket.on("connect", () => {
      console.log("🟢 [LiveMonitor] Socket connecté avec JWT");
      socket.emit("admin_join", { email: "monitoring@kocrou" });
    });

    socket.on("disconnect", () => {
      console.warn("🔴 [LiveMonitor] Socket déconnecté");
    });

    socket.on("monitoring_update", (data) => {
      if (data.admins) setAdmins(data.admins);
      if (data.adminCount !== undefined) {
        setConnectedCount(data.adminCount);
        updateChart(data.adminCount, reservations.length);
      }
    });

    socket.on("reservation_created", (data) => {
      message.success(`🚍 Réservation créée (${data.trajet?.villeDepart} → ${data.trajet?.villeArrivee})`);
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

  const updateChart = (adminCount, reservationCount) => {
    const timestamp = dayjs().format("HH:mm:ss");
    const newPoint = { time: timestamp, admins: adminCount, reservations: reservationCount };
    dataRef.current = [...dataRef.current, newPoint].slice(-15);
    setActivityData([...dataRef.current]);
  };

  const fetchMonitoringSnapshot = async () => {
    try {
      const { data } = await smartApi.get("/monitoring");
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

  const fetchReservations = async () => {
    try {
      const { data } = await smartApi.get("/reservations/admin/reservations?limit=5");
      setReservations(data.data || []);
      updateChart(connectedCount, data.data?.length || 0);
    } catch (err) {
      console.error("Erreur chargement réservations :", err);
    }
  };

  const adminColumns = [
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Dernière activité",
      dataIndex: "lastActive",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY HH:mm:ss") : "—"),
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

  const reservationColumns = [
    { title: "Client", dataIndex: ["user", "email"], key: "user" },
    {
      title: "Trajet",
      render: (r) => `${r.trajet?.villeDepart} → ${r.trajet?.villeArrivee || "-"}`,
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
                name === "admins" ? [`${value}`, "👑 Admins"] : [`${value}`, "🚌 Réservations"]}
            />
            <Legend />
            <Line type="monotone" dataKey="admins" stroke="#16a34a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="reservations" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title={`Administrateurs connectés (${connectedCount})`} bordered className="shadow-md">
        <Table columns={adminColumns} dataSource={admins} rowKey="email" pagination={false} />
      </Card>

      <Card title="Dernières réservations" bordered className="shadow-md">
        <Table columns={reservationColumns} dataSource={reservations} rowKey="_id" pagination={false} />
      </Card>
    </div>
  );
};

export default AdminLiveMonitor;
