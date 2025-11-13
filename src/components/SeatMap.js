// client/src/components/SeatGrid.js
import React from "react";
import { motion } from "framer-motion";
import { Armchair } from "lucide-react";

const SeatGrid = ({
  totalSeats = 40,
  reservedSeats = [],
  selectedSeats = [],
  toggleSeat = () => {},
  showLegend = true,
}) => {
  const cappedTotal = Math.min(Math.max(totalSeats, 1), 60);
  const seatsPerRow = 5;
  const totalRows = Math.ceil(cappedTotal / seatsPerRow);

  const seatNumberAt = (rowIndex, posInRow) =>
    rowIndex * seatsPerRow + posInRow + 1;

  const SeatButton = ({ seatNumber }) => {
    if (seatNumber > cappedTotal) return <div className="w-10 sm:w-12" />;

    const isReserved = reservedSeats.includes(seatNumber);
    const isSelected = selectedSeats.includes(seatNumber);

    return (
      <motion.button
        whileHover={!isReserved ? { scale: 1.05 } : undefined}
        whileTap={!isReserved ? { scale: 0.9 } : undefined}
        disabled={isReserved}
        onClick={() => !isReserved && toggleSeat(seatNumber)}
        className={`relative flex items-center justify-center
          w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl border font-semibold transition-all
          ${
            isReserved
              ? "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-70"
              : isSelected
              ? "bg-primary text-white border-primary shadow-lg"
              : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:shadow-md"
          }`}
        style={{
          boxShadow: isSelected
            ? "0 8px 14px rgba(59,130,246,0.35)"
            : "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Armchair
          className={`w-5 h-5 sm:w-6 sm:h-6 ${
            isReserved
              ? "text-gray-600/50"
              : isSelected
              ? "text-white"
              : "text-gray-700 dark:text-gray-200"
          }`}
        />
        <span className="absolute -bottom-1 right-1 text-[11px] sm:text-[13px] font-semibold text-gray-600 dark:text-gray-200 bg-white dark:bg-gray-800 px-1 rounded shadow-sm">
          {seatNumber}
        </span>
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 overflow-visible w-full max-w-full">
        {/* 🪑 Titre amélioré (plus grand) */}
        <div className="text-center text-gray-700 dark:text-gray-300 mb-8 mt-4">
          <p className="font-bold text-lg sm:text-xl md:text-2xl">
            Disposition des sièges
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 mt-1">
            Sélectionnez vos places
          </p>
        </div>

        {/* 🚍 Grille dynamique */}
        <div
          className="grid gap-x-3 gap-y-4 justify-items-center relative mx-auto px-2 sm:px-4"
          style={{
            gridTemplateColumns: "repeat(6, minmax(0, auto))", // 2 + allée + 3
            maxWidth: "100%",
          }}
        >
          {/* Allée centrale */}
          <div
            className="absolute left-1/2 -translate-x-1/2
                       w-8 sm:w-10 md:w-12 h-full
                       bg-gradient-to-b from-gray-200/80 to-gray-300/40
                       rounded-xl shadow-inner pointer-events-none"
          />

          {Array.from({ length: totalRows }).map((_, rowIdx) => {
            const s1 = seatNumberAt(rowIdx, 0);
            const s2 = seatNumberAt(rowIdx, 1);
            const s3 = seatNumberAt(rowIdx, 2);
            const s4 = seatNumberAt(rowIdx, 3);
            const s5 = seatNumberAt(rowIdx, 4);

            return (
              <React.Fragment key={`row-${rowIdx}`}>
                {/* 2 sièges à gauche */}
                <SeatButton seatNumber={s1} />
                <SeatButton seatNumber={s2} />
                {/* allée */}
                <div className="w-8 sm:w-10 md:w-12" />
                {/* 3 sièges à droite */}
                <SeatButton seatNumber={s3} />
                <SeatButton seatNumber={s4} />
                <SeatButton seatNumber={s5} />
              </React.Fragment>
            );
          })}
        </div>

        {/* 🧾 Légende */}
        {showLegend && (
          <div className="flex justify-center flex-wrap gap-6 sm:gap-8 mt-10 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-300 bg-primary inline-block" />
              <span>Sélectionné</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-400 bg-gray-300 inline-block" />
              <span>Réservé</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 inline-block" />
              <span>Disponible</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatGrid;




