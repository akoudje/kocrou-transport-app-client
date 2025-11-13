import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Destinations from "../components/Destinations";
import WhyChooseUs from "../components/WhyChooseUs";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display">
      <Header />
      <main>
        <Hero />
        <Destinations />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;

