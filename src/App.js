import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";

// 🌍 Pages publiques
import LandingPage from "./pages/LandingPage";
import SearchResults from "./pages/SearchResults";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import ReservationsPage from "./pages/ReservationsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./pages/ProtectedRoute";

// 🧑‍💼 Admin pages
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminTrajets from "./admin/pages/AdminTrajets";
import AdminReservations from "./admin/pages/AdminReservations";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminTicketView from "./admin/pages/AdminTicketView";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminLogs from "./admin/pages/AdminLogs";
import AdminNotifications from "./admin/pages/AdminNotifications";
import AdminReports from "./admin/pages/AdminReports";
import AdminLiveMonitor from "./admin/pages/AdminLiveMonitor";
import AdminActivity from "./admin/pages/AdminActivity";

// 🧱 Layouts
import AdminLayout from "./admin/layouts/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 🌍 Pages publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/recherche" element={<SearchResults />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔒 Pages protégées utilisateur */}
        <Route
          path="/reservation/:id"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute>
              <ConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mes-reservations"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />

        {/* 🧑‍💼 Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* 🧭 Layout Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="trajets" element={<AdminTrajets />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="utilisateurs" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="live-monitor" element={<AdminLiveMonitor />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="ticket/:id" element={<AdminTicketView />} />
        </Route>
      </Routes>
    </Router>
  );
};

// ✅ Fournisseurs globaux autour de l’application
ReactDOM.createRoot(document.getElementById("root")).render(
  <SettingsProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SettingsProvider>
);

export default App;
