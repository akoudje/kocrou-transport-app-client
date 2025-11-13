// src/components/Header.js
import React, { useEffect, useState, useContext } from "react";
import { Bus, Menu, Sun, Moon, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { SettingsContext } from "../context/SettingsContext";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { settings } = useContext(SettingsContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // 🌓 Gestion du thème clair/sombre
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // 🎨 Couleur principale issue du SettingsContext
  const primaryColor = settings?.couleurPrincipale || "#2563eb";

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full backdrop-blur-sm shadow-sm"
      style={{
        backgroundColor:
          theme === "light"
            ? "rgba(255,255,255,0.9)"
            : "rgba(17, 24, 39, 0.9)",
        borderBottom: `3px solid ${primaryColor}`,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* 🔹 Logo & Nom */}
          <Link to="/" className="flex items-center gap-3 group">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="w-10 h-10 object-contain rounded-md"
              />
            ) : (
              <Bus
                className="w-8 h-8 transition-colors"
                style={{ color: primaryColor }}
              />
            )}
            <h2
              className="text-xl font-bold tracking-tight transition-colors"
              style={{ color: primaryColor }}
            >
              {settings?.compagnieName || "Kocrou Transport"}
            </h2>
          </Link>

          {/* 🔸 Navigation desktop */}
          <nav className="hidden md:flex items-center gap-9">
            <a
              href="#hero"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition"
              style={{ "--tw-text-opacity": 1, color: primaryColor }}
            >
              Accueil
            </a>

            {user && (
              <Link
                to="/mes-reservations"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition"
                style={{ "--tw-text-opacity": 1, color: primaryColor }}
              >
                Mes Réservations
              </Link>
            )}

            <a
              href="#destinations"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition"
              style={{ "--tw-text-opacity": 1, color: primaryColor }}
            >
              Destinations
            </a>

            <a
              href="#contact"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition"
              style={{ "--tw-text-opacity": 1, color: primaryColor }}
            >
              Contact
            </a>
          </nav>

          {/* 🔸 Actions (thème + connexion) */}
          <div className="flex items-center gap-3 relative">
            {/* Thème */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Changer le thème"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            {/* Connexion / Profil */}
            {!user ? (
              <button
                onClick={() => navigate("/login")}
                className="h-10 px-4 text-white text-sm font-bold rounded-lg shadow-md transition"
                style={{ backgroundColor: primaryColor }}
              >
                Se connecter
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="hidden sm:flex items-center gap-2 h-10 px-4 bg-gray-100 dark:bg-gray-800 text-sm font-semibold rounded-lg hover:opacity-90 transition"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name?.split(" ")[0] || "Compte"}</span>
                </button>

                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                      >
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700"
            style={{
              backgroundColor:
                theme === "light"
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(17,24,39,0.95)",
            }}
          >
            <div className="flex flex-col p-4 space-y-3 text-gray-700 dark:text-gray-200">
              <a href="#hero" className="hover:opacity-80">Accueil</a>
              {user && (
                <Link to="/mes-reservations" className="hover:opacity-80">
                  Mes Réservations
                </Link>
              )}
              <a href="#destinations" className="hover:opacity-80">Destinations</a>
              <a href="#contact" className="hover:opacity-80">Contact</a>

              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="mt-3 text-white px-4 py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  Se connecter
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Déconnexion
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
