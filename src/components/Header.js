// ✅ Correction : ajout de const isAdmin = user?.isAdmin;

import React, { useEffect, useState, useContext } from "react";
import { Bus, Menu, Sun, Moon, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { SettingsContext } from "../context/SettingsContext";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { settings } = useContext(SettingsContext);
  const { user, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = user?.isAdmin; // ✅ Correction ajoutée ici

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between border-b border-subtle-light dark:border-subtle-dark">
          {/* Logo dynamique */}
          <Link to="/" className="flex items-center gap-3 text-primary">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            ) : (
              <Bus className="w-7 h-7" />
            )}
            <h2 className="text-xl font-bold tracking-tight text-text-light dark:text-text-dark">
              {settings?.compagnieName || "Kocrou Transport"}
            </h2>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-9">
            <a href="#hero" className="text-sm font-medium hover:text-primary transition">Accueil</a>
            {user && (
              <Link to="/mes-reservations" className="text-sm font-medium hover:text-primary transition">
                Mes Réservations
              </Link>
            )}
            <a href="#destinations" className="text-sm font-medium hover:text-primary transition">Destinations</a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition">Contact</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-subtle-light dark:hover:bg-subtle-dark"
              title="Changer le thème"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            {!user && !isAdmin ? (
              <button
                onClick={() => navigate("/login")}
                className="h-10 px-4 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition"
              >
                Se connecter
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="hidden sm:flex items-center gap-2 h-10 px-4 bg-subtle-light dark:bg-subtle-dark text-sm font-bold rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name?.split(" ")[0] || "Mon Compte"}</span>
                </button>

                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-subtle-light dark:border-subtle-dark overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-subtle-light dark:border-subtle-dark">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
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
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
