import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Destinations from "../components/Destinations";
import WhyChooseUs from "../components/WhyChooseUs";
import Footer from "../components/Footer";
import usePing from "../hooks/usePing";

const LandingPage = () => {
  const serverUp = usePing();

  if (!serverUp) {
    return (
      <div className="p-10 text-center text-red-500">
        ❌ Serveur injoignable. Veuillez vérifier votre connexion ou réessayer
        plus tard.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Destinations />
        <WhyChooseUs />
        <Footer />
      </main>
    </div>
  );
};

export default LandingPage;
