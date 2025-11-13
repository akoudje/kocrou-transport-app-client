import React from "react";
import { Wifi, Armchair, Euro } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Wifi className="w-7 h-7" />,
    title: "Wi-Fi Gratuit",
    description: "Restez connecté tout au long du trajet avec notre Wi-Fi à bord.",
  },
  {
    icon: <Armchair className="w-7 h-7" />,
    title: "Sièges Confortables",
    description: "Des sièges spacieux et inclinables pour voyager sereinement.",
  },
  {
    icon: <Euro className="w-7 h-7" />,
    title: "Prix Compétitifs",
    description: "Voyagez plus, dépensez moins grâce à nos tarifs avantageux.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 sm:py-24 bg-subtle-light/50 dark:bg-card-dark/20">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold sm:text-4xl mb-4"
        >
          Voyagez l'esprit tranquille
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-600 dark:text-gray-400 mb-12"
        >
          Découvrez les avantages de voyager avec Kocrou Transport.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex flex-col items-center text-center p-6 bg-card-light dark:bg-card-dark rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

