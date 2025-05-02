import React, { useState, useEffect } from "react";
import Battle from "./battle";

const Arena = () => {
  const [team, setTeam] = useState([]);
  const [opponents, setOpponents] = useState([]);
  const [allPokemons, setAllPokemons] = useState([]);
  const [opponentFound, setOpponentFound] = useState(false);
  const [showBattle, setShowBattle] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/team")
      .then((res) => res.json())
      .then((data) => setTeam(data))
      .catch((err) => console.error("Error:", err));

    fetch("https://pokeapi.co/api/v2/pokemon?limit=1000")
      .then((res) => res.json())
      .then((data) => setAllPokemons(data.results))
      .catch((err) => console.error("Error fetching Pokémon:", err));
  }, []);

  const getRandomPokemons = async () => {
    const selected = [];
    while (selected.length < 6) {
      const random = allPokemons[Math.floor(Math.random() * allPokemons.length)];
      if (!selected.some((p) => p.name === random.name)) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${random.name}`);
        const data = await res.json();
        selected.push({
          pokeId: data.id,
          name: data.name,
          image: data.sprites.front_default,
          type: data.types[0].type.name,
          health: data.stats[0].base_stat,
          damage: data.stats[1].base_stat,
          speed: data.stats.find((s) => s.stat.name === "speed").base_stat,
          abilities: data.abilities.map((a) => a.ability.name),
        });
      }
    }
    setOpponents(selected);
    setOpponentFound(true);
  };

  const getTotalDamage = (teamArr) =>
    teamArr.reduce((acc, curr) => acc + (curr.damage || 0), 0);

  return (
    <div
      className="flex flex-col items-center justify-center relative w-full overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 52px)", height: "calc(100vh - 52px)" }}
    >
      {showBattle ? (
        <Battle
          playerTeam={team}
          opponentTeam={opponents}
          onBattleEnd={() => setShowBattle(false)}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/battleground1.png')] z-0"></div>

          {/* Player Team */}
          <div className="flex flex-col items-center w-full max-w-4xl px-4 py-2 z-10">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 w-full justify-center">
              {team.map((pokemon) => (
                <div key={pokemon.id} className="flex justify-center items-center">
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 text-black text-base sm:text-lg font-bold text-center">
              Your Team Damage: {getTotalDamage(team)}
            </div>
          </div>

          {/* Controls */}
          <div className="z-10 flex flex-col items-center space-y-3 my-2">
            {!opponentFound ? (
              <button
                onClick={getRandomPokemons}
                className="px-4 py-2 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition duration-200"
              >
                Find Opponent
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowBattle(true)}
                  className="px-4 py-2 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition duration-200"
                >
                  Start Battle
                </button>
                <button
                  onClick={getRandomPokemons}
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-md shadow hover:shadow-md hover:scale-105 transition duration-200"
                >
                  Find Again
                </button>
              </>
            )}
          </div>

          {/* Opponent Team */}
          <div className="flex flex-col items-center w-full max-w-4xl px-4 py-2 z-10">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 w-full justify-center">
              {opponents.map((pokemon, index) => (
                <div key={index} className="flex justify-center items-center">
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 text-black text-base sm:text-lg font-bold text-center">
              Opponent Team Damage: {getTotalDamage(opponents)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Arena;
