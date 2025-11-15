// client/src/admin/pages/AdminReports.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Loader2,
  Download,
  BarChart3,
  PieChart,
  CalendarDays,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import smartApi from "../../utils/smartApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  PieChart as RPieChart,
  Cell,
} from "recharts";

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState("");
  const token = localStorage.getItem("admintoken");

  // 🎯 Charger les données du backend (robuste : accepte data.data ou data)
  const fetchReport = async () => {
    try {
      setLoading(true);
      const { data } = await smartApi.get(`/reports?month=${monthFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // supporte { data: {...} } ou {...}
      setReportData(data?.data ?? data ?? null);
    } catch (err) {
      console.error("Erreur chargement rapport :", err);
      Swal.fire("Erreur", "Impossible de charger les rapports.", "error");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthFilter]);

  // 📊 Génération Excel (sécurisée)
  const exportToExcel = () => {
    if (!reportData) {
      Swal.fire("Aucune donnée", "Aucun rapport à exporter.", "info");
      return;
    }
    const wb = XLSX.utils.book_new();

    const reservations = Array.isArray(reportData.reservations)
      ? reportData.reservations
      : [];

    const reservationsSheet = XLSX.utils.json_to_sheet(reservations);
    XLSX.utils.book_append_sheet(wb, reservationsSheet, "Réservations");

    const statsSheet = XLSX.utils.json_to_sheet([
      {
        "Total Réservations": reportData.totalReservations ?? 0,
        "Total Revenus": `${Number(reportData.totalRevenue ?? 0).toLocaleString()} FCFA`,
        "Réservations Validées": reportData.validatedCount ?? 0,
        "Réservations Annulées": reportData.cancelledCount ?? 0,
      },
    ]);
    XLSX.utils.book_append_sheet(wb, statsSheet, "Statistiques");

    XLSX.writeFile(wb, "rapport_kocrou_transport.xlsx");
  };

  // 📄 Génération PDF (sécurisée)
  const exportToPDF = () => {
    if (!reportData) {
      Swal.fire("Aucune donnée", "Aucun rapport à exporter.", "info");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Rapport Kocrou Transport", 14, 20);
    doc.text(
      `Période : ${monthFilter || "Tous les mois"} - Généré le ${new Date().toLocaleDateString(
        "fr-FR"
      )}`,
      14,
      28
    );

    doc.autoTable({
      startY: 35,
      head: [["Type", "Valeur"]],
      body: [
        ["Total Réservations", reportData.totalReservations ?? 0],
        ["Total Revenus", `${Number(reportData.totalRevenue ?? 0).toLocaleString()} FCFA`],
        ["Validées", reportData.validatedCount ?? 0],
        ["Annulées", reportData.cancelledCount ?? 0],
      ],
    });

    doc.save("rapport_kocrou_transport.pdf");
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  // Valeurs sécurisées pour l'affichage
  const totalReservations = reportData?.totalReservations ?? 0;
  const totalRevenue = Number(reportData?.totalRevenue ?? 0);
  const validatedCount = reportData?.validatedCount ?? 0;
  const cancelledCount = reportData?.cancelledCount ?? 0;
  const dailyStats = Array.isArray(reportData?.dailyStats) ? reportData.dailyStats : [];

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
            <FileText className="w-6 h-6 text-primary" /> Rapports &amp;
            Statistiques
          </h1>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-primary w-4 h-4" />
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              />
            </div>

            <button
              onClick={fetchReport}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Actualiser
            </button>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <Download className="w-4 h-4" /> Excel
            </button>

            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {/* 🧾 Contenu */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin w-6 h-6 mr-2 text-primary" />
            Chargement des rapports...
          </div>
        ) : !reportData ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-20">
            Aucun rapport disponible 📭
          </p>
        ) : (
          <>
            {/* 🔸 Statistiques globales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard
                title="Total Réservations"
                value={totalReservations}
                color="text-blue-500"
              />
              <StatCard
                title="Revenus Totaux"
                value={`${totalRevenue.toLocaleString()} FCFA`}
                color="text-green-500"
              />
              <StatCard
                title="Validées"
                value={validatedCount}
                color="text-emerald-500"
              />
              <StatCard
                title="Annulées"
                value={cancelledCount}
                color="text-red-500"
              />
            </div>

            {/* 📊 Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 🔹 Histogramme */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Réservations par jour
                </h3>

                {dailyStats.length === 0 ? (
                  <p className="text-center text-gray-500">Aucune statistique journalière disponible.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyStats}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {/* safe keys: use properties if they exist, otherwise fallback to zero */}
                      <Bar dataKey="confirmées" fill="#3B82F6" />
                      <Bar dataKey="annulées" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* 🔸 Diagramme circulaire */}
              <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" /> Répartition des statuts
                </h3>

                <ResponsiveContainer width="100%" height={300}>
                  <RPieChart>
                    <Pie
                      dataKey="value"
                      data={[
                        { name: "Confirmées", value: validatedCount },
                        { name: "Annulées", value: cancelledCount },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {[validatedCount, cancelledCount].map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

// 🧩 Composant carte de statistiques
const StatCard = ({ title, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-md text-center"
  >
    <h4 className="text-gray-500 dark:text-gray-400 text-sm">{title}</h4>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </motion.div>
);

export default AdminReports;
