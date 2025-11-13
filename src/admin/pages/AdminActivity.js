import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../utils/api";

// 🧩 Intervalle du rafraîchissement des logs
const REFRESH_INTERVAL = 60000; // 1 min

const AdminActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);

  const token = localStorage.getItem("token");

  /**
   * 🧠 Fonction de rafraîchissement du token silencieux
   * (exécutée périodiquement pour prolonger la session)
   */
  const refreshTokenSilently = async () => {
    try {
      const { data } = await api.get("/auth/refresh", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.token) {
        localStorage.setItem("token", data.token);
        setTokenValid(true);
      }
    } catch (err) {
      console.warn("⚠️ Impossible de rafraîchir le token :", err?.response?.status);
      if (err?.response?.status === 401) {
        setTokenValid(false);
      }
    }
  };

  /**
   * 🔍 Chargement de l’historique d’activité admin
   */
  const fetchActivities = async () => {
    if (!token) {
      console.warn("⚠️ Aucun token, activités non chargées.");
      setLoading(false);
      setTokenValid(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get("/reports/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const logs = Array.isArray(data.data) ? data.data : [];
      setActivities(
        logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (err) {
      console.error("❌ Erreur chargement activités :", err);
      Swal.fire(
        "Erreur",
        "Impossible de charger l’historique d’activité.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ⚡ useEffect — Chargement initial + rafraîchissement périodique
   */
  useEffect(() => {
    fetchActivities();
    refreshTokenSilently();

    const interval = setInterval(() => {
      fetchActivities();
      refreshTokenSilently();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [token]);

  // 🧩 Si pas de token ou session expirée
  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
        <ShieldAlert className="w-6 h-6 mr-2 text-red-500" />
        Session expirée — veuillez vous reconnecter.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* 🔹 En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Historique d’activité
          </h1>

          <button
            onClick={fetchActivities}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>

        {/* 🧱 Contenu */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin w-6 h-6 mr-2 text-primary" />
            Chargement de l’historique...
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-20">
            Aucun événement d’activité enregistré 🕊️
          </p>
        ) : (
          <div className="overflow-x-auto shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Utilisateur</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.map((act, i) => (
                  <motion.tr
                    key={act._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {new Date(act.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        act.type === "error"
                          ? "text-red-500"
                          : act.type === "warning"
                          ? "text-yellow-500"
                          : act.type === "security"
                          ? "text-blue-500"
                          : "text-green-500"
                      }`}
                    >
                      {act.type || "info"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {act.user?.name || "Système"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {act.action || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {act.details || act.description || "—"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminActivity;
