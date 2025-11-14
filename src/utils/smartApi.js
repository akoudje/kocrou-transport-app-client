// client/src/utils/smartApi.js
import { userApi, adminApi } from "./api";

const isAdminContext = () => {
  const pathname = window.location.pathname;
  const token = localStorage.getItem("adminToken");
  return pathname.startsWith("/admin") && !!token;
};

const smartApi = {
  get: (...args) => (isAdminContext() ? adminApi.get(...args) : userApi.get(...args)),
  post: (...args) => (isAdminContext() ? adminApi.post(...args) : userApi.post(...args)),
  put: (...args) => (isAdminContext() ? adminApi.put(...args) : userApi.put(...args)),
  delete: (...args) => (isAdminContext() ? adminApi.delete(...args) : userApi.delete(...args)),
  patch: (...args) => (isAdminContext() ? adminApi.patch(...args) : userApi.patch(...args)),
};

export default smartApi;