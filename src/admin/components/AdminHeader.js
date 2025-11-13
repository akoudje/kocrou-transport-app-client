import React, { useState, useEffect } from "react";
import { Sun, Moon, UserCircle2, Clock } from "lucide-react";

const AdminHeader = ({ title, lastUpdated, onRefresh, loading }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const getTimeSinceUpdate = (date) => {
    if (!date) return "—";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `il y a ${diff}s`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)} h`;
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-card-dark shadow-sm sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>Dernière mise à jour : {getTimeSinceUpdate(lastUpdated)}</span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`ml-4 px-3 py-1 text-sm rounded-md transition flex items-center gap-2 ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 00-10 10h4z"
                />
              </svg>
              Chargement...
            </>
          ) : (
            "🔄 Rafraîchir"
          )}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Changer le thème"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-700" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-400" />
          )}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <UserCircle2 className="w-6 h-6 text-primary" />
          <div>
            <p className="font-semibold">{user.name || "Admin"}</p>
            <p className="text-xs opacity-70">
              {user.email || "admin@kocrou.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
