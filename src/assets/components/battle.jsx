import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Battle = ({ playerTeam, opponentTeam, onBattleEnd }) => {
  const [playerIndex, setPlayerIndex] = useState(0);
  const [opponentIndex, setOpponentIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [battleOver, setBattleOver] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBattleOverModal, setShowBattleOverModal] = useState(false);
  const [battleResult, setBattleResult] = useState(null);

  const [playerAnimation, setPlayerAnimation] = useState("");
  const [opponentAnimation, setOpponentAnimation] = useState("");

  const [playerHPs, setPlayerHPs] = useState(playerTeam.map((p) => p.health));
  const [opponentHPs, setOpponentHPs] = useState(
    opponentTeam.map((p) => p.health)
  );

  const player = { ...playerTeam[playerIndex] };
  const opponent = { ...opponentTeam[opponentIndex] };

  const damage = (atk) => atk;

  const findNextAlive = (HPs) => HPs.findIndex((hp) => hp > 0);

  const handleWin = () => {
    setMessage(`${player.name} defeated ${opponent.name}!`);
    const nextIndex = findNextAlive(
      opponentHPs.map((hp, i) => (i === opponentIndex ? 0 : hp))
    );

    if (nextIndex === -1) {
      setMessage("🏆 You defeated all opponents!");
      setBattleResult("win");
      setBattleOver(true);
      setShowBattleOverModal(true);
      return;
    }

    setTimeout(() => {
      setOpponentIndex(nextIndex);
      setAnimating(false);
    }, 1500);
  };

  const handleLoss = () => {
    setMessage(`${player.name} fainted!`);
    const nextIndex = findNextAlive(
      playerHPs.map((hp, i) => (i === playerIndex ? 0 : hp))
    );

    if (nextIndex === -1) {
      setMessage("❌ All your Pokémon fainted!");
      setBattleResult("lose");
      setBattleOver(true);
      setShowBattleOverModal(true);

      return;
    }

    setTimeout(() => {
      setPlayerIndex(nextIndex);
      setAnimating(false);
    }, 1500);
  };

  const attack = () => {
    if (
      battleOver ||
      animating ||
      playerHPs[playerIndex] <= 0 ||
      opponentHPs[opponentIndex] <= 0
    )
      return;

    setAnimating(true);
    const speedFirst = player.speed >= opponent.speed ? "player" : "opponent";
    const pAtk = damage(player.damage);
    const oAtk = damage(opponent.damage);

    let tempPlayerHP = playerHPs[playerIndex];
    let tempOpponentHP = opponentHPs[opponentIndex];

    const doPlayerAttack = () => {
      setPlayerAnimation({ x: [0, 30, 0], transition: { duration: 0.5 } });
      setTimeout(() => {
        setOpponentAnimation({
          rotate: [0, -15, 15, 0],
          transition: { duration: 0.5 },
        });
        setTimeout(() => {
          tempOpponentHP -= pAtk;
          setOpponentHPs((prev) => {
            const updated = [...prev];
            updated[opponentIndex] = tempOpponentHP;
            return updated;
          });
          setMessage(`${player.name} attacks!`);
          if (tempOpponentHP <= 0) return handleWin();
          setTimeout(doOpponentAttack, 1000);
        }, 1000);
      }, 1000);
    };

    const doOpponentAttack = () => {
      setOpponentAnimation({ x: [0, -30, 0], transition: { duration: 0.5 } });
      setTimeout(() => {
        setPlayerAnimation({
          rotate: [0, -15, 15, 0],
          transition: { duration: 0.5 },
        });
        setTimeout(() => {
          tempPlayerHP -= oAtk;
          setPlayerHPs((prev) => {
            const updated = [...prev];
            updated[playerIndex] = tempPlayerHP;
            return updated;
          });
          setMessage(`${opponent.name} attacks!`);
          if (tempPlayerHP <= 0) return handleLoss();

          // Player attacks after surviving opponent’s attack
          setTimeout(() => {
            setPlayerAnimation({
              x: [0, 30, 0],
              transition: { duration: 0.5 },
            });
            setTimeout(() => {
              setOpponentAnimation({
                rotate: [0, -15, 15, 0],
                transition: { duration: 0.5 },
              });
              setTimeout(() => {
                tempOpponentHP -= pAtk;
                setOpponentHPs((prev) => {
                  const updated = [...prev];
                  updated[opponentIndex] = tempOpponentHP;
                  return updated;
                });
                setMessage(`${player.name} counterattacks!`);
                if (tempOpponentHP <= 0) return handleWin();
                setAnimating(false);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    };

    if (speedFirst === "player") {
      doPlayerAttack();
    } else {
      doOpponentAttack();
    }
  };

  const switchPokemon = () => {
    if (battleOver || animating || playerHPs[playerIndex] <= 0) return;
    setShowModal(true);
  };

  const handleSwitch = (index) => {
    if (index === playerIndex || playerHPs[index] <= 0) return;

    setPlayerIndex(index);
    setMessage(`🔁 Switched to ${playerTeam[index].name}`);
    setShowModal(false);
    setAnimating(false);
  };

  const saveBattleData = async () => {
    const now = new Date();
    const playerAlive = playerTeam.filter((_, i) => playerHPs[i] > 0);
    const playerDead = playerTeam.filter((_, i) => playerHPs[i] <= 0);
    const opponentAlive = opponentTeam.filter((_, i) => opponentHPs[i] > 0);
    const opponentDead = opponentTeam.filter((_, i) => opponentHPs[i] <= 0);

    const battleData = {
      date: now.toLocaleString(),
      result: battleResult,
      playerUsed: playerTeam,
      playerAlive,
      playerDead,
      opponentAlive,
      opponentDead,
    };

    try {
      await fetch("https://pokemonsimulator.onrender.com/battles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(battleData),
      });
      onBattleEnd(); // Reset or go back to team selection
    } catch (err) {
      console.error("Failed to save battle data", err);
    }
  };

  return (
    <div
      className="w-screen bg-[url('/battleground1.png')] bg-cover bg-no-repeat bg-center flex flex-col font-mono text-white"
      style={{ height: "calc(100vh - 52px)" }}
    >
      <div className="flex justify-between items-center flex-grow px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 gap-2">
        {/* Player Pokémon */}
        <div className="flex flex-col items-center min-w-[45vw] sm:min-w-[40vw] translate-y-10 sm:translate-y-0">
          {/* Pokéballs and Status */}
          <div className="flex gap-1 mb-2">
            {playerHPs.map((hp, idx) => (
              <img
                key={idx}
                src={hp > 0 ? "/pokeball-full.png" : "/pokeball-faint.png"}
                alt="pokeball"
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              />
            ))}
          </div>

          <div className="bg-black/70 border border-white p-2 sm:p-3 rounded-lg w-48 sm:w-56 md:w-64 shadow-md text-xs sm:text-sm md:text-base">
            <h2 className="text-base sm:text-lg md:text-xl font-bold">
              {player.name}
            </h2>
            <div className="bg-gray-700 h-3 sm:h-4 w-full mt-2 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  playerHPs[playerIndex] / player.health < 0.3
                    ? "bg-red-500"
                    : playerHPs[playerIndex] / player.health < 0.6
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${(playerHPs[playerIndex] / player.health) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>HP</span>
              <span>
                {playerHPs[playerIndex]} / {player.health}
              </span>
            </div>
            <div className="flex justify-between text-xs px-1 font-semibold mt-2">
              <div>ATK: {player.damage}</div>
              <div>SPD: {player.speed}</div>
            </div>
          </div>

          <motion.img
            src={player.image}
            alt={player.name}
            className="h-36 sm:h-44 md:h-56 drop-shadow-lg"
            animate={playerAnimation}
            onAnimationComplete={() => setPlayerAnimation("")}
          />
        </div>

        {/* Opponent Pokémon */}
        <div className="flex flex-col items-center min-w-[45vw] sm:min-w-[40vw] -translate-y-20 sm:translate-y-0">
          <div className="flex gap-1 mb-2">
            {opponentHPs.map((hp, idx) => (
              <img
                key={idx}
                src={hp > 0 ? "/pokeball-full.png" : "/pokeball-faint.png"}
                alt="pokeball"
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              />
            ))}
          </div>

          <div className="bg-black/70 border border-white p-2 sm:p-3 rounded-lg w-48 sm:w-56 md:w-64 shadow-md text-xs sm:text-sm md:text-base text-right">
            <h2 className="text-base sm:text-lg md:text-xl font-bold">
              {opponent.name}
            </h2>
            <div className="bg-gray-700 h-3 sm:h-4 w-full mt-2 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  opponentHPs[opponentIndex] / opponent.health < 0.3
                    ? "bg-red-500"
                    : opponentHPs[opponentIndex] / opponent.health < 0.6
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${
                    (opponentHPs[opponentIndex] / opponent.health) * 100
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>HP</span>
              <span>
                {opponentHPs[opponentIndex]} / {opponent.health}
              </span>
            </div>
            <div className="flex justify-between text-xs px-1 font-semibold mt-2">
              <div>ATK: {opponent.damage}</div>
              <div>SPD: {opponent.speed}</div>
            </div>
          </div>

          <motion.img
            src={opponent.image}
            alt={opponent.name}
            className="h-36 sm:h-44 md:h-56 drop-shadow-lg"
            animate={opponentAnimation}
            onAnimationComplete={() => setOpponentAnimation("")}
          />
        </div>
      </div>

      <div className="text-black rounded-t-2xl max-w-4xl w-full mx-auto shadow-lg fixed bottom-3 left-1/2 transform -translate-x-1/2">
        <div className="flex justify-center">
          <div className="text-xl font-semibold min-h-[3rem] transition-all text-center">
            {message || `What should ${player.name} do?`}
          </div>
        </div>

        {!battleOver && (
          <div className="flex flex-row justify-center gap-x-6 pt-6">
            <button
              onClick={attack}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-xl shadow font-bold text-lg transition"
            >
              FIGHT
            </button>
            <button
              onClick={switchPokemon}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl shadow font-bold text-lg transition"
            >
              Switch
            </button>
          </div>
        )}
      </div>

      {/* Switch Modal */}
      {showModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-white text-black rounded-xl p-3 max-w-sm w-[90%] shadow-xl space-y-2 max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold text-center mb-2">
        Choose a Pokémon to Switch
      </h2>

      <div className="grid grid-cols-1 gap-2">
        {playerTeam.map((poke, idx) => {
          const hpRatio = playerHPs[idx] / poke.health;
          const maxStat = 200;

          return (
            <button
              key={poke.name}
              onClick={() => handleSwitch(idx)}
              disabled={playerHPs[idx] <= 0 || idx === playerIndex}
              className={`border rounded-lg p-2 flex items-center gap-2 transition hover:scale-105 ${
                playerHPs[idx] <= 0
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <img
                src={poke.image}
                alt={poke.name}
                className="w-10 h-10"
              />
              <div className="flex-1 text-sm">
                <p className="font-semibold mb-1">{poke.name}</p>

                <div className="flex flex-col gap-1 text-xs">
                  {/* HP */}
                  <div className="flex items-center gap-1">
                    <span className="w-8">HP</span>
                    <div className="flex-1 bg-gray-300 h-1 rounded">
                      <div
                        className={`h-full rounded ${
                          hpRatio < 0.3
                            ? "bg-red-500"
                            : hpRatio < 0.6
                            ? "bg-yellow-400"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${hpRatio * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right">
                      {playerHPs[idx]} / {poke.health}
                    </span>
                  </div>

                  {/* ATK */}
                  <div className="flex items-center gap-1">
                    <span className="w-8">ATK</span>
                    <div className="flex-1 bg-gray-300 h-1 rounded">
                      <div
                        className="bg-purple-500 h-full rounded"
                        style={{
                          width: `${(poke.damage / maxStat) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right">{poke.damage}</span>
                  </div>

                  {/* SPD */}
                  <div className="flex items-center gap-1">
                    <span className="w-8">SPD</span>
                    <div className="flex-1 bg-gray-300 h-1 rounded">
                      <div
                        className="bg-blue-500 h-full rounded"
                        style={{
                          width: `${(poke.speed / maxStat) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right">{poke.speed}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => setShowModal(false)}
          className="mt-2 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


      <AnimatePresence>
        {showBattleOverModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-yellow-100 to-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full text-center font-mono"
            >
              {/* Battle Result */}
              <h2
                className={`text-4xl font-bold mb-4 ${
                  battleResult === "win" ? "text-green-600" : "text-red-600"
                }`}
              >
                {battleResult === "win" ? "🏆 Victory!" : "❌ Defeat!"}
              </h2>

              {/* Pokémon Overview */}
              <div className="flex flex-col md:flex-row justify-around gap-6">
                {/* Player's Team */}
                <div className="w-full">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Your Team
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {playerTeam.map((pokemon, idx) => (
                      <div
                        key={pokemon.name}
                        className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${
                          playerHPs[idx] > 0
                            ? "border-green-500 bg-green-100"
                            : "border-red-500 bg-red-100 grayscale opacity-60"
                        }`}
                      >
                        <img
                          src={pokemon.image}
                          alt={pokemon.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="mt-8">
                <button
                  onClick={() => {
                    saveBattleData();
                    setShowModal(false);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Battle;
