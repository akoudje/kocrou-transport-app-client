/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // Active le mode sombre avec la classe 'dark'
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "Poppins", "sans-serif"],
      },
      colors: {
        // 🌞 Mode clair
        "background-light": "#F9FAFB",
        "card-light": "#FFFFFF",
        "subtle-light": "#E5E7EB",
        "text-light": "#111827",

        // 🌚 Mode sombre
        "background-dark": "#0D121B",
        "card-dark": "#1A2234",
        "subtle-dark": "#2C3446",
        "text-dark": "#F3F4F6",

        // 🎨 Couleurs de marque
        primary: "#2563EB", // Bleu moderne
        secondary: "#16A34A", // Vert accent
        accent: "#FACC15", // Jaune accent
      },
      boxShadow: {
        glow: "0 0 15px rgba(37, 99, 235, 0.3)",
      },
      transitionDuration: {
        400: "400ms",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
