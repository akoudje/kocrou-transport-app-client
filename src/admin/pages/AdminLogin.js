import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, LockKeyhole, Mail } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../utils/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // 🔁 Redirige si déjà connecté
  useEffect(() => {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
    if (adminUser?.isAdmin) navigate("/admin/");
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);

      if (!data.user?.isAdmin) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        Swal.fire({
          icon: "error",
          title: "Accès refusé 🚫",
          text: "Ce compte n’est pas autorisé à accéder à l’administration.",
        });
        return;
      }

      // ✅ Stocker tokens et rediriger
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminRefreshToken", data.refreshToken);
      localStorage.setItem("adminUser", JSON.stringify(data.user));

      Swal.fire({
        icon: "success",
        title: "Connexion réussie ✅",
        text: "Bienvenue sur le tableau de bord administrateur.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/");
    } catch (err) {
      console.error("Erreur de connexion admin :", err);
      Swal.fire({
        icon: "error",
        title: "Erreur de connexion",
        text: err.response?.data?.message || "Identifiants incorrects ou serveur injoignable.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-card-dark shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col items-center mb-8">
          <ShieldCheck className="w-12 h-12 text-primary mb-3" />
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
            Connexion Administrateur
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Accédez à l’espace d’administration Kocrou
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full pl-9 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
                placeholder="admin@kocrou.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <LockKeyhole className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full pl-9 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition flex justify-center items-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Kocrou Transport — Espace Administrateur
        </p>
      </motion.div>
    </section>
  );
};

export default AdminLogin;