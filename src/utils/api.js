import axios from "axios";
import Swal from "sweetalert2";

/* =========================================================
   🌍 BASE API URL — Gestion dynamique ENV (local + Vercel)
   ========================================================= */
const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") ||
  (window.location.hostname.includes("localhost")
    ? "http://localhost:5000"
    : "https://kocrou-transport-app-server.onrender.com");

console.log("📡 API_BASE =", API_BASE);

/* =========================================================
   🧩 INSTANCE AXIOS CENTRALISÉE
   ========================================================= */
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ autorise cookies CORS si nécessaires
});

/* =========================================================
   🔒 INTERCEPTEUR DE REQUÊTES — Ajout Token
   ========================================================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   ⚠️ INTERCEPTEUR DE RÉPONSES — Gestion Erreurs / Refresh
   ========================================================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      "Une erreur est survenue lors de la communication avec le serveur.";

    // 🔁 Tentative de refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {
            refreshToken,
          });

          const newToken = data.token;
          localStorage.setItem("token", newToken);
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          console.warn("⚠️ Refresh token invalide :", refreshError.message);
          handleSessionExpired();
          return Promise.reject(refreshError);
        }
      } else handleSessionExpired();
    }

    /* =========================================================
       🚨 ERREURS SERVEUR / RÉSEAU
       ========================================================= */
    if (!error.response) {
      Swal.fire({
        icon: "error",
        title: "Serveur injoignable",
        text: "Impossible de contacter le serveur. Vérifiez votre connexion Internet.",
        confirmButtonColor: "#2563eb",
      });
      console.error("❌ Erreur réseau :", error.message);
      return Promise.reject(error);
    }

    const alertOptions = {
      confirmButtonColor: "#2563eb",
      text: message,
    };

    switch (status) {
      case 400:
        Swal.fire({ icon: "warning", title: "Requête invalide", ...alertOptions });
        break;
      case 403:
        Swal.fire({
          icon: "error",
          title: "Accès refusé",
          text: "Vous n'avez pas les droits nécessaires pour accéder à cette ressource.",
          ...alertOptions,
        });
        break;
      case 404:
        Swal.fire({ icon: "info", title: "Non trouvé", ...alertOptions });
        break;
      case 500:
      default:
        Swal.fire({
          icon: "error",
          title: "Erreur serveur",
          text: "Le serveur a rencontré un problème. Réessayez plus tard.",
          ...alertOptions,
        });
        break;
    }

    console.error(`❌ Erreur API [${status}]:`, message);
    return Promise.reject(error);
  }
);

/* =========================================================
   🧠 GESTION AUTOMATIQUE DE SESSION EXPIRÉE
   ========================================================= */
function handleSessionExpired() {
  Swal.fire({
    icon: "warning",
    title: "Session expirée",
    text: "Votre session a expiré. Veuillez vous reconnecter.",
    confirmButtonColor: "#2563eb",
  }).then(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/admin-login";
  });
}

export default api;
