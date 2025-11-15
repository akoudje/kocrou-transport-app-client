// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 🌍 Pages publiques
import LandingPage from "./pages/LandingPage";
import SearchResults from "./pages/SearchResults";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import ReservationsPage from "./pages/ReservationsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import ServerStatusBanner from "./components/ServerStatusBanner";



// 🧑‍💼 Admin
import AdminLogin from "./admin/pages/AdminLogin";
import AdminLayout from "./admin/layouts/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import {
  AdminDashboard,
  AdminTrajets,
  AdminReservations,
  AdminUsers,
  AdminTicketView,
  AdminSettings,
  AdminLogs,
  AdminNotifications,
  AdminReports,
  AdminLiveMonitor,
  AdminActivity,
} from "./admin/pages";

const App = () => (
  <Router>
    <Routes>
      {/* 🌍 Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/recherche" element={<SearchResults />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/serverstatusbanner" element={<ServerStatusBanner />} />
      
      {/* 🔒 Utilisateur */}
      <Route path="/reservation/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
      <Route path="/confirmation" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
      <Route path="/mes-reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />

      {/* 🧑‍💼 Admin */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
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

      {/* 🧭 Fallback */}
      <Route path="*" element={<div>Page introuvable</div>} />
    </Routes>
  </Router>
);

export default App;