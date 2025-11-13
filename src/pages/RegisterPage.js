import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await register(form.name, form.email, form.password);

    if (success) {
      Swal.fire({
        icon: "success",
        title: "Compte créé 🎉",
        text: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        confirmButtonColor: "#16a34a",
        timer: 2500,
      });
      navigate("/login");
    } else {
      Swal.fire({
        icon: "error",
        title: "Erreur d'inscription",
        text: error || "Impossible de créer le compte. Réessayez plus tard.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-6 text-primary">
          <UserPlus className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Créer un compte</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Nom complet</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ex: Junior Akoudjé"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-subtle-light dark:bg-subtle-dark text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Adresse e-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="exemple@mail.com"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-subtle-light dark:bg-subtle-dark text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-subtle-light dark:bg-subtle-dark text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {error && (
            <p className="text-center text-sm mt-3 text-red-500 bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Création du compte...
              </>
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà inscrit ?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-primary cursor-pointer hover:underline"
          >
            Se connecter
          </span>
        </p>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          © {new Date().getFullYear()} Kocrou Transport. Tous droits réservés.
        </p>
      </motion.div>
    </section>
  );
};

export default RegisterPage;

