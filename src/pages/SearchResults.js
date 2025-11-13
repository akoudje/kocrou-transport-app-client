// client/src/pages/SearchResults.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bus, Loader2, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { io } from "socket.io-client";
import api from "../utils/api";

// 🔌 Connexion WebSocket globale
const socket = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
  transports: ["websocket"],
});

const SearchResults = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const depart = params.get("depart") || "";
  const arrivee = params.get("arrivee") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const MySwal = withReactContent(Swal);

  /* -------------------------------------------------------------
   * 📦 Charger les trajets filtrés depuis l'API
   * ----------------------------------------------------------- */
  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/trajets", { params: { depart, arrivee } });
      const trajets = data.data || data;

      const formattedResults = trajets.flatMap((trajet) => {
        const segmentsIndependants =
          trajet.segments?.map((s, index) => ({
            // ⚠️ ID virtuel uniquement pour React key
            _id: `${trajet._id}-seg-${index}`,
            type: "segment",
            trajetId: trajet._id, // ✅ vrai ID MongoDB utilisé pour la réservation
            villeDepart: s.depart,
            villeArrivee: s.arrivee,
            prixTotal: s.prix,
            compagnie: trajet.compagnie,
            nombrePlaces: trajet.nombrePlaces,
            placesRestantes: trajet.placesRestantes,
          })) || [];

        const trajetPrincipal = {
          _id: trajet._id,
          type: "principal",
          trajetId: trajet._id,
          villeDepart: trajet.villeDepart,
          villeArrivee: trajet.villeArrivee,
          prixTotal: trajet.prixTotal || trajet.prix,
          compagnie: trajet.compagnie,
          nombrePlaces: trajet.nombrePlaces,
          placesRestantes: trajet.placesRestantes,
        };

        return [trajetPrincipal, ...segmentsIndependants];
      });

      setResults(formattedResults);
    } catch (err) {
      console.error("❌ Erreur chargement trajets :", err);
      setError("Impossible de charger les trajets. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------
   * 🔁 Mise à jour temps réel avec Socket.io
   * ----------------------------------------------------------- */
  useEffect(() => {
    fetchResults();

    socket.on("reservation_created", (r) => {
      console.log("🆕 Réservation créée :", r);

      // ✅ Toast visuel (SweetAlert2)
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `🚍 Nouveau passager réservé sur ${
          r.trajet?.villeDepart || "?"
        } → ${r.trajet?.villeArrivee || "?"}`,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: "#f0fdf4",
        color: "#166534",
      });

      fetchResults();
    });

    socket.on("reservation_deleted", (r) => {
      console.log("❌ Réservation annulée :", r);

      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "🪑 Une place vient d’être libérée !",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#eff6ff",
        color: "#1e3a8a",
      });

      fetchResults();
    });

    socket.on("reservation_updated", (r) => {
      console.log("🔄 Réservation mise à jour :", r);
      fetchResults();
    });

    return () => {
      socket.off("reservation_created");
      socket.off("reservation_updated");
      socket.off("reservation_deleted");
    };
  }, [depart, arrivee]);

  /* -------------------------------------------------------------
   * 🌀 États de chargement et d’erreur
   * ----------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-3" />
        <p className="text-gray-600">Recherche des trajets disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * 🧭 Affichage principal
   * ----------------------------------------------------------- */
  return (
    <section className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary font-medium mb-6 hover:underline"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-center"
        >
          Trajets disponibles —{" "}
          <span className="text-primary font-extrabold">
            {depart} → {arrivee}
          </span>
        </motion.h1>

        {results.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Aucun trajet trouvé pour cette recherche 😢
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((trajet) => (
              <TrajetCard key={trajet._id} trajet={trajet} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
 * 🧩 Carte individuelle d’un trajet ou segment
 * ----------------------------------------------------------- */
const TrajetCard = ({ trajet, navigate }) => {
  const placesRestantes = trajet.placesRestantes ?? trajet.nombrePlaces ?? 0;

  const couleurDisponibilite =
    placesRestantes <= 5
      ? "text-red-500"
      : placesRestantes <= 10
      ? "text-orange-500"
      : "text-green-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow hover:shadow-lg transition"
    >
      <div className="flex items-center gap-4 mb-3">
        <Bus className="w-8 h-8 text-primary" />
        <div>
          <h3 className="font-extrabold text-xl">
            {trajet.villeDepart} → {trajet.villeArrivee}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-primary" />
            {trajet.compagnie || "Kocrou Transport & Frères"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-between items-center flex-wrap gap-3">
        <div className="flex flex-col text-left">
          <p className="font-semibold text-primary text-lg">
            {trajet.prixTotal.toLocaleString()} FCFA
          </p>
          <p className={`text-sm ${couleurDisponibilite}`}>
            {placesRestantes > 0
              ? `${placesRestantes} place${
                  placesRestantes > 1 ? "s" : ""
                } restante${placesRestantes > 1 ? "s" : ""}`
              : "Complet ❌"}
          </p>
        </div>

        <button
          type="button"
          disabled={placesRestantes === 0}
          onClick={() =>
            navigate(`/reservation/${trajet.trajetId}`, {
              state: {
                trajet: {
                  ...trajet,
                  _id: trajet.trajetId, // ✅ force l'ID MongoDB correct
                },
                segment:
                  trajet.type === "segment"
                    ? {
                        depart: trajet.villeDepart,
                        arrivee: trajet.villeArrivee,
                        prix: trajet.prixTotal,
                      }
                    : null,
              },
            })
          }
          className={`px-5 py-2 rounded-lg text-white font-medium transition ${
            placesRestantes === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {placesRestantes === 0 ? "Complet" : "Réserver"}
        </button>
      </div>
    </motion.div>
  );
};

export default SearchResults;
