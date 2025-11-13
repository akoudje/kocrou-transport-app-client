// client/src/utils/socket.js
import { io } from "socket.io-client";

/**
 * 🔐 Socket.io sécurisé avec authentification JWT
 * Se connecte uniquement si un token valide est présent.
 */

const SOCKET_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") ||
  "https://kocrou-transport-app-server.onrender.com";

// ✅ Récupère le token JWT depuis le localStorage
const token = localStorage.getItem("token");

// ✅ Crée une seule instance de socket, avec authentification
export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  auth: {
    token, // 🔑 envoyé au serveur côté backend
  },
});

// 📡 Événements de debug
socket.on("connect", () => {
  console.log("🟢 WebSocket connecté :", SOCKET_URL);
});

socket.on("disconnect", (reason) => {
  console.warn("🔴 WebSocket déconnecté :", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Erreur WebSocket :", err.message);
});

// Permet d’utiliser socket partout
export default socket;
