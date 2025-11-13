// src/client/admin/pages/AdminReservations.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Search,
  BadgeCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const AdminReservations = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔹 États principaux
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Filtres
  const [statusFilter, setStatusFilter] = useState("toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [villeDepartFilter, setVilleDepartFilter] = useState("");
  const [villeArriveeFilter, setVilleArriveeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ==========================================================
   * 🔄 Charger les réservations avec filtres + pagination
   * ========================================================== */
  const fetchReservations = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 10, // nombre de lignes par page
      };

      if (statusFilter !== "toutes") params.statut = statusFilter;
      if (searchTerm) params.email = searchTerm;
      if (companyFilter) params.compagnie = companyFilter;
      if (villeDepartFilter) params.villeDepart = villeDepartFilter;
      if (villeArriveeFilter) params.villeArrivee = villeArriveeFilter;
      if (dateFilter) params.dateDepart = dateFilter;

      const { data } = await api.get("/reservations/admin/reservations", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const reservationsList = data?.data ?? [];
      setReservations(Array.isArray(reservationsList) ? reservationsList : []);
      setTotalPages(data?.totalPages || 1);
      setCurrentPage(data?.currentPage || 1);
    } catch (err) {
      console.error("Erreur chargement réservations :", err);
      Swal.fire("Erreur", "Impossible de charger les réservations.", "error");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  /* ==========================================================
   * ⚙️ Actions admin : Annuler / Valider / Supprimer
   * ========================================================== */
  const handleCancel = async (id) => {
    const ask = await Swal.fire({
      title: "Annuler cette réservation ?",
      text: "L'utilisateur verra cette réservation comme annulée.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, annuler",
      cancelButtonText: "Non",
    });

    if (!ask.isConfirmed) return;

    try {
      await api.put(`/reservations/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire("✅ Annulée", "La réservation a été annulée.", "success");
      fetchReservations(currentPage);
    } catch (err) {
      console.error("Erreur annulation :", err);
      Swal.fire("Erreur", "Impossible d’annuler la réservation.", "error");
    }
  };

  const handleValidate = async (id) => {
    const ask = await Swal.fire({
      title: "Valider l’embarquement ?",
      text: "Cela confirmera que le passager est monté à bord.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Oui, valider",
      cancelButtonText: "Annuler",
    });

    if (!ask.isConfirmed) return;

    try {
      await api.put(`/reservations/${id}/validate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire("✅ Validée", "Réservation marquée comme embarquée.", "success");
      fetchReservations(currentPage);
    } catch (err) {
      console.error("Erreur validation :", err);
      Swal.fire("Erreur", "Impossible de valider cette réservation.", "error");
    }
  };

  const handleDelete = async (id) => {
    const ask = await Swal.fire({
      title: "Supprimer cette réservation ?",
      text: "Cette action supprimera définitivement la réservation.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!ask.isConfirmed) return;

    try {
      await api.delete(`/reservations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire("🗑️ Supprimée", "Réservation supprimée.", "success");
      fetchReservations(currentPage);
    } catch (err) {
      console.error("Erreur suppression :", err);
      Swal.fire("Erreur", "Impossible de supprimer cette réservation.", "error");
    }
  };

  /* ==========================================================
   * 🧭 Rendu principal
   * ========================================================== */
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="flex-1 flex flex-col">
        <main className="p-6 space-y-8">
          {/* 🔹 Titre */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
              🎟️ Gestion des Réservations
            </h2>
          </div>

          {/* 🔍 Filtres avancés */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            {/* Recherche */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg flex-1 min-w-[200px]">
              <Search className="text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nom / Email client"
                className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Compagnie */}
            <input
              type="text"
              placeholder="Compagnie"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
              onChange={(e) => setCompanyFilter(e.target.value)}
            />

            {/* Ville départ */}
            <input
              type="text"
              placeholder="Ville départ"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
              onChange={(e) => setVilleDepartFilter(e.target.value)}
            />

            {/* Ville arrivée */}
            <input
              type="text"
              placeholder="Ville arrivée"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
              onChange={(e) => setVilleArriveeFilter(e.target.value)}
            />

            {/* Date */}
            <input
              type="date"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
              onChange={(e) => setDateFilter(e.target.value)}
            />

            {/* Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
            >
              <option value="toutes">Toutes</option>
              <option value="confirmée">Confirmées</option>
              <option value="validée">Validées</option>
              <option value="annulée">Annulées</option>
            </select>

            {/* Bouton filtrer */}
            <button
              onClick={() => fetchReservations(1)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
            >
              <RefreshCw className="w-4 h-4" /> Filtrer
            </button>
          </div>

          {/* 🧱 Tableau */}
          {loading ? (
            <div className="flex justify-center items-center py-20 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-6 h-6 mr-2 animate-spin text-primary" />
              Chargement des réservations...
            </div>
          ) : reservations.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-20">
              Aucune réservation trouvée.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto bg-white dark:bg-card-dark rounded-xl shadow">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs">
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Trajet</th>
                      <th className="py-3 px-4 text-center">Sièges</th>
                      <th className="py-3 px-4 text-center">Date</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <motion.tr
                        key={r._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200">
                          {r.user?.name || "Utilisateur inconnu"}
                          <p className="text-xs text-gray-500">{r.user?.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          {r.trajet?.villeDepart} → {r.trajet?.villeArrivee}
                          <p className="text-xs text-gray-400">{r.trajet?.compagnie}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {Array.isArray(r.seats)
                            ? r.seats.join(", ")
                            : r.seat || "-"}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500">
                          {new Date(r.createdAt).toLocaleString("fr-FR")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.statut === "confirmée" && (
                            <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Confirmée
                            </span>
                          )}
                          {r.statut === "validée" && (
                            <span className="text-blue-600 font-semibold flex items-center justify-center gap-1">
                              <BadgeCheck className="w-4 h-4" /> Validée
                            </span>
                          )}
                          {r.statut === "annulée" && (
                            <span className="text-red-500 font-semibold flex items-center justify-center gap-1">
                              <XCircle className="w-4 h-4" /> Annulée
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center flex justify-center gap-3">
                          <button
                            onClick={() =>
                              navigate("/admin/ticket-view", {
                                state: { reservation: r },
                              })
                            }
                            className="text-primary hover:text-primary/80 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" /> Voir
                          </button>

                          {r.statut === "confirmée" && (
                            <>
                              <button
                                onClick={() => handleValidate(r._id)}
                                className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                              >
                                <BadgeCheck className="w-4 h-4" /> Valider
                              </button>

                              <button
                                onClick={() => handleCancel(r._id)}
                                className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
                              >
                                <XCircle className="w-4 h-4" /> Annuler
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(r._id)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 🔽 Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchReservations(currentPage - 1)}
                    className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  >
                    ← Précédent
                  </button>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchReservations(currentPage + 1)}
                    className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminReservations;
