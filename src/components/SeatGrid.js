import React from "react";
import { motion } from "framer-motion";
import { Armchair } from "lucide-react";

/**
 * SeatGrid — version finale :
 * ✅ Sièges réservés grisés, inactifs et non cliquables
 * 💬 Tooltip explicite au survol
 * 🪑 Apparition fluide et responsive
 */
const SeatGrid = ({
  totalSeats = 60,
  reservedSeats = [],
  selectedSeats = [],
  toggleSeat = () => {},
  showLegend = true,
}) => {
  const cappedTotal = Math.min(Math.max(totalSeats, 1), 60);
  const seatsPerRow = 5;
  const totalRows = Math.ceil(cappedTotal / seatsPerRow);

  // 🔹 Normaliser les sièges réservés en nombres uniques
  const normalizedReserved = Array.from(
    new Set(reservedSeats.map((s) => Number(s)).filter((n) => !isNaN(n)))
  );

  const seatNumberAt = (rowIndex, posInRow) =>
    rowIndex * seatsPerRow + posInRow + 1;

  const gridVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.03 } },
  };

  const seatVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  // 🎫 Siège individuel
  const SeatButton = ({ seatNumber }) => {
    if (seatNumber > cappedTotal) return <div className="w-10 md:w-12" />;

    const isReserved = normalizedReserved.includes(seatNumber);
    const isSelected = selectedSeats.includes(seatNumber);

    return (
      <motion.div
        variants={seatVariants}
        className="relative flex items-center justify-center group"
      >
        {/* === Siège === */}
        <motion.button
          whileHover={!isReserved ? { scale: 1.05 } : undefined}
          whileTap={!isReserved ? { scale: 0.95 } : undefined}
          disabled={isReserved}
          onClick={() => !isReserved && toggleSeat(seatNumber)}
          className={`relative flex items-center justify-center
            w-10 h-10 sm:w-12 sm:h-12 rounded-xl border font-semibold
            transition-all duration-200 outline-none select-none
            ${
              isReserved
                ? "cursor-not-allowed pointer-events-none"
                : isSelected
                ? "bg-primary text-white border-primary shadow-lg"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-primary/10"
            }`}
          style={{
            // 🩶 Force la couleur grise pour les sièges réservés
            backgroundColor: isReserved ? "#d1d5db" : undefined, // gray-300
            borderColor: isReserved ? "#9ca3af" : undefined, // gray-400
            color: isReserved ? "#6b7280" : undefined, // gray-500
            boxShadow: isSelected
              ? "0 6px 14px rgba(59,130,246,0.35)"
              : "0 1px 4px rgba(0,0,0,0.05)",
          }}
          title={
            isReserved
              ? "Siège réservé par un autre passager"
              : `Siège ${seatNumber} disponible`
          }
        >
          <Armchair
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              isReserved
                ? "text-gray-600/60"
                : isSelected
                ? "text-white"
                : "text-gray-700 dark:text-gray-200"
            }`}
          />
          <span
            className="absolute -bottom-1 -right-1 text-[12px] sm:text-[13px] font-semibold
                       text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700
                       px-1 rounded border border-gray-200 dark:border-gray-600"
          >
            {seatNumber}
          </span>
        </motion.button>

        {/* 💬 Infobulle au survol */}
        {isReserved && (
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-20
                       px-2 py-1 text-[11px] rounded-md text-white bg-gray-800 shadow-md
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
          >
            Siège réservé par un autre passager
            <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={gridVariants}
      className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl mx-auto"
    >
      {/* 🪑 Titre */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Disposition des sièges
        </h2>
        <p className="text-sm sm:text-base text-gray-500">
          Sélectionnez vos places
        </p>
      </div>

      {/* 🧱 Grille des sièges */}
      <div
        className="grid grid-cols-[auto,auto,2rem,auto,auto,auto]
                   sm:grid-cols-[auto,auto,3rem,auto,auto,auto]
                   gap-3 sm:gap-4 justify-items-center relative mx-auto"
        style={{ maxWidth: 550 }}
      >
       
        {Array.from({ length: totalRows }).map((_, rowIdx) => {
          const s1 = seatNumberAt(rowIdx, 0);
          const s2 = seatNumberAt(rowIdx, 1);
          const s3 = seatNumberAt(rowIdx, 2);
          const s4 = seatNumberAt(rowIdx, 3);
          const s5 = seatNumberAt(rowIdx, 4);

          return (
            <React.Fragment key={`row-${rowIdx}`}>
              <SeatButton seatNumber={s1} />
              <SeatButton seatNumber={s2} />
              <SeatButton seatNumber={s3} />
              <SeatButton seatNumber={s4} />
              <SeatButton seatNumber={s5} />
            </React.Fragment>
          );
        })}
      </div>

      {/* 🔍 Légende */}
      {showLegend && (
        <div className="flex justify-center flex-wrap gap-6 mt-8 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded border border-gray-300 bg-primary inline-block" />
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded border border-gray-400 bg-gray-300 inline-block" />
            <span>Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded border border-gray-300 bg-white inline-block" />
            <span>Disponible</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SeatGrid;

