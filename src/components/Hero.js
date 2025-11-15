// src/components/Hero.js
import React, { useState, useContext } from "react";
import { MapPin, Calendar, Users, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SettingsContext } from "../context/SettingsContext";

const Hero = () => {
  const navigate = useNavigate();
  const { settings } = useContext(SettingsContext);

  const [form, setForm] = useState({
    depart: "",
    arrivee: "",
    date: "",
    passagers: "1",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams(form).toString();
    navigate(`/recherche?${query}`);
  };

  const primaryColor = settings?.couleurPrincipale || "#2563eb";

  return (
    <section
      id="hero"
      className="relative flex min-h-[560px] items-center justify-center py-16 text-center overflow-hidden"
    >
      {/* 🔹 Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:          
            "url('https://www.chi-athenaeum.org/assets/components/phpthumbof/cache/8044_4.49ec5f47011c8a46f651e6ad01428bb5.jpg')"
        }}
      ></div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4">
        {/* 🔹 Titre principal */}
        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg">
          Voyagez simplement, <br />
          <span style={{ color: primaryColor }}>réservez maintenant</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-gray-200 md:text-lg">
          Trouvez les meilleurs trajets en bus pour votre prochaine aventure.
        </p>

        {/* 🔹 Formulaire de recherche */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-xl bg-white/90 dark:bg-card-dark/90 backdrop-blur-md p-4 sm:p-6 shadow-2xl"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            {/* Champ départ */}
            <label className="flex flex-col text-left">
              <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Départ
              </p>
              <div className="relative">
                <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="depart"
                  placeholder="Ville de départ"
                  value={form.depart}
                  onChange={handleChange}
                  className="w-full h-14 pl-10 pr-4 rounded-lg bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </label>

            {/* Champ arrivée */}
            <label className="flex flex-col text-left">
              <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Destination
              </p>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="arrivee"
                  placeholder="Ville d'arrivée"
                  value={form.arrivee}
                  onChange={handleChange}
                  className="w-full h-14 pl-10 pr-4 rounded-lg bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </label>

            {/* Champ date */}
            <label className="flex flex-col text-left">
              <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Date de départ
              </p>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full h-14 pl-10 pr-4 rounded-lg bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </label>

            {/* Champ passagers */}
            {/*             <label className="flex flex-col text-left">
              <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Passagers
              </p>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="passagers"
                  min="1"
                  value={form.passagers}
                  onChange={handleChange}
                  className="w-full h-14 pl-10 pr-4 rounded-lg bg-subtle-light dark:bg-subtle-dark focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </label> */}

            {/* Bouton principal dynamique */}
            <button
              type="submit"
              className="h-14 px-6 text-white font-semibold rounded-lg shadow-md transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;
