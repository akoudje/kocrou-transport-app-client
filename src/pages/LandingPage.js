import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Destinations from "../components/Destinations";
import WhyChooseUs from "../components/WhyChooseUs";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
/*     <div className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display">
      <Header />
      <main>
        <Hero />
        <Destinations />
        <WhyChooseUs />
      </main>
      <Footer />
    </div> */

 <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Destinations />
        <WhyChooseUs />
      </main>
      <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700">
        © {new Date().getFullYear()} Kocrou Transport. Tous droits réservés.
      </footer>
    </div>
  );
};

export default LandingPage;

