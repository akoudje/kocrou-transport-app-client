import React, { useEffect, useState, useContext } from "react";
import { Bus, Menu, Sun, Moon, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { SettingsContext } from "../context/SettingsContext";
import logoBus from "../assets/images/logobus.png";

const Header = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { settings } = useContext(SettingsContext);

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
          {/* 🔹 Logo */}
          <Link to="/" className="flex items-center gap-3 text-primary">
            <img
              src={logoBus}
              alt="Logo Kocrou Transport"
              className="h-auto w-[180px] object-contain"
            />
          </Link>

          {/* 🔹 Logo dynamique */}
          {settings?.logo && (
            <img
              src={settings.logo}
              alt="Logo"
              className="mx-auto mb-6 w-24 h-24 object-contain rounded-md"
            />
          )}

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-9">
            <a
              href="#hero"
              className="text-sm font-medium hover:text-primary transition"
            >
              Accueil
            </a>
            {user && (
              <Link
                to="/mes-reservations"
                className="text-sm font-medium hover:text-primary transition"
              >
                Mes Réservations
              </Link>
            )}
            <a
              href="#destinations"
              className="text-sm font-medium hover:text-primary transition"
            >
              Destinations
            </a>
            <a
              href="#contact"
              className="text-sm font-medium hover:text-primary transition"
            >
              Contact
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 relative">
            {/* Thème */}
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

            {/* Connexion / Compte */}
            {!user ? (
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
                  <span>{user.name?.split(" ")[0] || "Mon Compte"}</span>
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
              className="md:hidden p-2 rounded-lg hover:bg-subtle-light dark:hover:bg-subtle-dark"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background-light dark:bg-background-dark border-t border-subtle-light dark:border-subtle-dark"
          >
            <div className="flex flex-col p-4 space-y-3">
              <a href="#hero" className="hover:text-primary">
                Accueil
              </a>
              {user && (
                <Link to="/mes-reservations" className="hover:text-primary">
                  Mes Réservations
                </Link>
              )}
              <a href="#destinations" className="hover:text-primary">
                Destinations
              </a>
              <a href="#contact" className="hover:text-primary">
                Contact
              </a>
              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="mt-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  Se connecter
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
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
