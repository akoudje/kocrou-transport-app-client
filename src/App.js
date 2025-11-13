import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

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

// 🧱 Layout et sécurité Admin
import AdminLayout from "./admin/layouts/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

const App = () => {
  return (
    <Router>
      <AuthProvider>
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
                {" "}
                <BookingPage />{" "}
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
                {" "}
                <AdminLayout />{" "}
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="trajets" element={<AdminTrajets />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="utilisateurs" element={<AdminUsers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/live-monitor" element={<AdminLiveMonitor />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
            <Route path="/admin/" element={<AdminDashboard />} />

            {/* ✅ Fix ici : route relative (et non /admin/...) */}
            <Route path="ticket/:id" element={<AdminTicketView />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
