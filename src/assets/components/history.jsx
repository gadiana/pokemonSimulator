import React, { useEffect, useState } from "react";

const History = () => {
  const [battles, setBattles] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/battles")
      .then((res) => res.json())
      .then((data) => setBattles(data.reverse()))
      .catch((err) => console.error("Failed to fetch battles", err));
  }, []);

  const renderPokemonImages = (pokemons, faintedList) =>
    pokemons.map((p, index) => {
      const isFainted = faintedList.some(f => f.name === p.name);
      return (
        <img
          key={index}
          src={p.image}
          alt={p.name}
          title={p.name}
          className={`w-8 h-8 rounded-full border-2 m-1
            ${isFainted ? "border-red-500 grayscale" : "border-green-500"}`}
        />
      );
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div
      className="p-4 sm:p-7 w-screen bg-[url('/battleground1.png')] bg-cover bg-no-repeat bg-center flex flex-col font-mono text-white"
      style={{ height: "calc(100vh - 52px)" }}
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-black">⚔️ Battle History</h1>
      <div className="overflow-x-auto hide-scrollbar">
  <table className="min-w-full backdrop-blur-md bg-black/30 text-white border border-white/10 rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-black/50">
            <tr>
              <th className="p-2 sm:p-3 border border-white/10 text-sm sm:text-base">Result</th>
              <th className="p-2 sm:p-3 border border-white/10 text-sm sm:text-base">Player Pokémon</th>
              <th className="p-2 sm:p-3 border border-white/10 text-sm sm:text-base">Opponent Pokémon</th>
              <th className="p-2 sm:p-3 border border-white/10 text-sm sm:text-base">Date</th>
              <th className="p-2 sm:p-3 border border-white/10 text-sm sm:text-base">Time</th>
            </tr>
          </thead>
          <tbody>
            {battles.map((battle, index) => {
              const { date, time } = formatDate(battle.date);
              return (
                <tr
                  key={index}
                  className="bg-black/50 hover:bg-black/40 transition duration-200"
                >
                  <td className="p-2 sm:p-3 border border-white/10 text-center text-xs sm:text-sm">
                    {battle.result === "win" ? "🏆 Win" : "❌ Loss"}
                  </td>
                  <td className="p-2 sm:p-3 border border-white/10 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                      {renderPokemonImages(battle.playerUsed, battle.playerDead)}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 border border-white/10 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                      {renderPokemonImages(
                        battle.opponentAlive.concat(battle.opponentDead),
                        battle.opponentDead
                      )}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 border border-white/10 text-center text-xs sm:text-sm">{date}</td>
                  <td className="p-2 sm:p-3 border border-white/10 text-center text-xs sm:text-sm">{time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
