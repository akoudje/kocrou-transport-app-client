import { useEffect, useState } from "react";
import smartApi from "../utils/smartApi";

const usePing = () => {
  const [serverUp, setServerUp] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        await smartApi.get("/ping");
        setServerUp(true);
      } catch (err) {
        console.warn("🔌 Serveur injoignable :", err.message);
        setServerUp(false);
      }
    };
    check();
  }, []);

  return serverUp;
};

export default usePing;