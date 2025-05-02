import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";

const Team = () => {
  const [team, setTeam] = useState([]);
  const [allPokemons, setAllPokemons] = useState([]);
  const [fullPokemonList, setFullPokemonList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMode, setIsAddMode] = useState(false);
  const pokemonsPerPage = 12;

  useEffect(() => {
    fetch("https://pokemonsimulator.onrender.com/team")
      .then((res) => res.json())
      .then((data) => setTeam(data))
      .catch((err) => console.error("Error:", err));

    fetch("https://pokeapi.co/api/v2/pokemon?limit=10000")
      .then((res) => res.json())
      .then((data) => {
        setAllPokemons(data.results);
        setFullPokemonList(data.results);
      })
      .catch((err) => console.error("Error fetching Pokémon:", err));
  }, []);

  const handleChangePokemon = (index) => {
    setSelectedIndex(index);
    setIsAddMode(false);
    setShowModal(true);
  };

  const handleAddPokemonToTeam = () => {
    setSelectedIndex(null);
    setIsAddMode(true);
    setShowModal(true);
  };

  const handlePokemonSelect = (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleSavePokemon = () => {
    if (!selectedPokemon) return;
    fetch(`https://pokeapi.co/api/v2/pokemon/${selectedPokemon.name}`)
      .then((res) => res.json())
      .then((pokemonData) => {
        const newPokemon = {
          pokeId: pokemonData.id,
          name: pokemonData.name,
          image: pokemonData.sprites.front_default,
          type: pokemonData.types[0].type.name,
          health: pokemonData.stats[0].base_stat,
          damage: pokemonData.stats[1].base_stat,
          abilities: pokemonData.abilities.map((a) => a.ability.name),
        };

        if (isAddMode) {
          fetch(`https://pokemonsimulator.onrender.com/team`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPokemon),
          })
            .then((res) => res.json())
            .then((addedPokemon) => {
              setTeam([...team, addedPokemon]);
              setShowModal(false);
            });
        } else if (selectedIndex !== null) {
          newPokemon.id = team[selectedIndex].id;
          fetch(`https://pokemonsimulator.onrender.com/team/${team[selectedIndex].id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPokemon),
          })
            .then((res) => res.json())
            .then((updated) => {
              const newTeam = [...team];
              newTeam[selectedIndex] = updated;
              setTeam(newTeam);
              setShowModal(false);
            });
        }
      });
  };

  const filteredPokemons = fullPokemonList.filter((p) =>
    p.name.includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPokemons.length / pokemonsPerPage);
  const paginatedPokemons = filteredPokemons.slice(
    (currentPage - 1) * pokemonsPerPage,
    currentPage * pokemonsPerPage
  );

  const handleRemove = (id) => {
    fetch(`https://pokemonsimulator.onrender.com/team/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setTeam(team.filter((pokemon) => pokemon.id !== id));
      })
      .catch((err) => console.error("Error deleting Pokémon:", err));
  };

  return (
    <div
      className="flex justify-center items-center"
      style={{ maxHeight: "calc(100vh - 52px)", height: "calc(100vh - 52px)" }}
    >
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/battleground1.png')] z-0"></div>

      <style>
        {`
          @keyframes walk {
            0% { transform: translateX(0px) rotate(0deg); }
            25% { transform: translateX(2px) rotate(1deg); }
            50% { transform: translateX(0px) rotate(0deg); }
            75% { transform: translateX(-2px) rotate(-1deg); }
            100% { transform: translateX(0px) rotate(0deg); }
          }
        `}
      </style>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-4 max-w-5xl mx-auto w-full px-2 sm:px-4 py-4 overflow-y-auto">
        {team.map((pokemon, index) => (
          <div key={pokemon.id} className="relative group">
<img
  src={pokemon.image}
  alt={pokemon.name}
  className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 mx-auto animate-[walk_1s_ease-in-out_infinite]"
/>

            <button
              onClick={() => handleChangePokemon(index)}
              className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 hover:rotate-360"
              title="Change Pokémon"
            >
              <MdEdit className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => handleRemove(pokemon.id)}
              className="absolute top-10 right-1 bg-red-500 border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:rotate-90"
              title="Remove Pokémon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}

        {team.length < 6 && (
          <div
            className="relative group w-32 h-32 sm:w-40 sm:h-40 bg-white/30 bg-white/30 backdrop-blur-md rounded-xl border border-white/30 flex items-center justify-center text-7xl text-thin shadow-lg cursor-pointer"
            onClick={handleAddPokemonToTeam}
          >
            <FaPlus title="Add a Pokemon" />
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50000">
          <div className="bg-gradient-to-b from-gray-100 to-white rounded-xl p-4 sm:p-6 w-[95%] sm:w-full max-w-3xl shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {isAddMode ? "Add Pokémon to Team" : "Choose Your Pokémon"}
            </h2>
            <input
              type="text"
              placeholder="Search Pokémon..."
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              value={searchTerm}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
              {paginatedPokemons.map((pokemon) => (
                <div
                  key={pokemon.name}
                  className={`cursor-pointer p-3 sm:p-4 rounded-lg shadow-md border hover:shadow-lg transition-all ${
                    selectedPokemon?.name === pokemon.name
                      ? "ring-2 ring-blue-500"
                      : "bg-white"
                  }`}
                  onClick={() => handlePokemonSelect(pokemon)}
                >
                  <div className="text-center font-semibold text-lg capitalize mb-2">
                    {pokemon.name}
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                        pokemon.url.split("/")[6]
                      }.png`}
                      alt={pokemon.name}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center space-x-4 mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={handleSavePokemon}
              >
                {isAddMode ? "Add" : "Replace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
