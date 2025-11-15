// client/src/components/ServerStatusBanner.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const ServerStatusBanner = () => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ping`, {
          timeout: 3000,
        });
        if (response.status === 200) {
          setStatus("online");
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("offline");
      }
    };

    checkServer();
  }, []);

  const bannerStyle = {
    padding: "8px 16px",
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  };

  if (status === "checking") {
    return <div style={{ ...bannerStyle, backgroundColor: "#facc15" }}>🔄 Vérification du serveur...</div>;
  }

  if (status === "online") {
    return <div style={{ ...bannerStyle, backgroundColor: "#16a34a" }}>✅ Serveur opérationnel</div>;
  }

  if (status === "offline") {
    return <div style={{ ...bannerStyle, backgroundColor: "#dc2626" }}>❌ Serveur injoignable</div>;
  }

  return null;
};

export default ServerStatusBanner;