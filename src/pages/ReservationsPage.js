import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Loader2, Trash2, Bus, CalendarDays, MapPin, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import smartApi from "../utils/smartApi";

// 🔌 Connexion WebSocket
const socket = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
  transports: ["websocket"],
});

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ----------------------------------------------------------
   * 🔁 Charger les réservations utilisateur
   * -------------------------------------------------------- */
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await smartApi.get("/reservations");
      setReservations(res.data);
    } catch (err) {
      console.error("Erreur chargement réservations :", err);
      setError("Impossible de charger vos réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();

    // 🧩 Écoute des événements socket.io
    socket.on("reservation_created", (r) => {
      console.log("🆕 Nouvelle réservation :", r);
      fetchReservations();
    });

    socket.on("reservation_updated", (update) => {
      console.log("🔁 Réservation mise à jour :", update);
      fetchReservations();
    });

    socket.on("reservation_deleted", (deleted) => {
      console.log("❌ Réservation supprimée :", deleted);
      fetchReservations();
    });

    // Nettoyage à la fermeture du composant
    return () => {
      socket.off("reservation_created");
      socket.off("reservation_updated");
      socket.off("reservation_deleted");
    };
  }, []);

  /* ----------------------------------------------------------
   * ❌ Suppression / annulation d’une réservation
   * -------------------------------------------------------- */
  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "Supprimer cette réservation ?",
      text: "Cette action est définitive.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await smartApi.delete(`/reservations/${id}`);
      Swal.fire({
        title: "Réservation supprimée ✅",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
      fetchReservations();
    } catch (err) {
      console.error("Erreur suppression réservation :", err);
      Swal.fire({
        title: "Erreur",
        text: "Impossible d'annuler cette réservation pour le moment.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  /* ----------------------------------------------------------
   * 🌀 États de chargement et d’erreur
   * -------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-primary" />
        Chargement de vos réservations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchReservations}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  /* ----------------------------------------------------------
   * 🧾 Affichage principal
   * -------------------------------------------------------- */
  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
        type="button"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </button>

      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-center"
        >
          🧾 Mes Réservations
        </motion.h1>

        {reservations.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            Vous n'avez aucune réservation enregistrée.
          </div>
        ) : (
          <div className="space-y-5">
            {reservations.map((res) => (
              <motion.div
                key={res._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-card-dark p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <Bus className="text-primary w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg">
                      {res.trajet?.compagnie || "Kocrou Transport"}
                    </h3>
                    <p className="text-gray-500 flex items-center gap-1 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      {res.trajet?.villeDepart} → {res.trajet?.villeArrivee}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Siège : <strong>#{res.seat}</strong>
                    </p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />{" "}
                      {new Date(res.dateReservation).toLocaleString("fr-FR")}
                    </p>
                    <p
                      className={`text-xs mt-1 font-semibold ${
                        res.statut === "confirmée"
                          ? "text-green-600"
                          : res.statut === "validée"
                          ? "text-blue-600"
                          : "text-red-500"
                      }`}
                    >
                      {res.statut === "confirmée"
                        ? "✔️ Confirmée"
                        : res.statut === "validée"
                        ? "🟢 Validée à l’embarquement"
                        : "❌ Annulée"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 mt-4 md:mt-0">
                  <button
                    onClick={() =>
                      navigate("/confirmation", { state: { reservation: res } })
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
                  >
                    <Ticket className="w-4 h-4" /> Voir le ticket
                  </button>

                  {res.statut === "confirmée" && (
                    <button
                      onClick={() => handleDelete(res._id)}
                      className="flex items-center gap-2 px-4 py-2 border border-red-400 
                                 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 
                                 transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Annuler
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReservationsPage;
