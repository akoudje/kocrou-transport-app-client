import { userApi, adminApi } from "./api";

/* =========================================================
   🧠 Détection du contexte admin
   ========================================================= */
const isAdminContext = () => {
  const pathname = window.location.pathname;
  const token = localStorage.getItem("adminToken");
  return pathname.startsWith("/admin") && !!token;
};

/* =========================================================
   🧩 Wrapper intelligent autour des instances Axios
   ========================================================= */
const smartApi = {
  get: (...args) => (isAdminContext() ? adminApi.get(...args) : userApi.get(...args)),
  post: (...args) => (isAdminContext() ? adminApi.post(...args) : userApi.post(...args)),
  put: (...args) => (isAdminContext() ? adminApi.put(...args) : userApi.put(...args)),
  delete: (...args) => (isAdminContext() ? adminApi.delete(...args) : userApi.delete(...args)),
  patch: (...args) => (isAdminContext() ? adminApi.patch(...args) : userApi.patch(...args)),

   /* ✅ Injecte dynamiquement le token */
  setAuthHeader: (token) => {
    const instance = isAdminContext() ? adminApi : userApi;
    if (token && instance?.defaults?.headers?.common) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete instance?.defaults?.headers?.common?.["Authorization"];
    }
  },

  /* ✅ Accès direct à l’instance active */
  getActiveInstance: () => (isAdminContext() ? adminApi : userApi),
};

export default smartApi;

