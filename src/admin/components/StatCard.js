// src/admin/components/StatCard.jsx
import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-card-dark rounded-xl shadow p-5 flex items-center justify-between"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">{value}</h2>
      </div>
      <div className={`${colors[color]} bg-opacity-10 p-3 rounded-full`}>{icon}</div>
    </motion.div>
  );
};

export default StatCard;
