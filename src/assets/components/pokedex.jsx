import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Pokedex() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [team, setTeam] = useState([]);
  const [adding, setAdding] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const API_URL = "https://pokemonsimulator.onrender.com/team";


  const fetchPokemonList = async (
    url = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0"
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(url);
      setNextUrl(res.data.next);
      setPrevUrl(res.data.previous);
      setTotalPages(Math.ceil(res.data.count / 20));

      const offset = new URL(url).searchParams.get("offset") || 0;
      setCurrentPage(Math.floor(offset / 20) + 1);

      const detailedPromises = res.data.results.map((p) => axios.get(p.url));
      const detailedResults = await Promise.all(detailedPromises);

      const detailedList = detailedResults.map((res) => {
        const data = res.data;
        return {
          id: data.id,
          name: data.name,
          image: data.sprites.front_default,
          type: data.types[0].type.name,
          damage: data.stats[2].base_stat,
          attacks: data.abilities.map((a) => a.ability.name),
          health: data.stats[1].base_stat,
          speed: data.stats.find((s) => s.stat.name === "speed").base_stat,
          friendly: data.base_experience,
          url: `https://pokeapi.co/api/v2/pokemon/${data.id}/`,
        };
      });

      setPokemonList(detailedList);
      setFilteredPokemon(detailedList);
    } catch (error) {
      console.error("Failed to fetch Pokémon list:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPokemonList();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchAndFilterAllPokemon = async () => {
        if (searchTerm.trim() === "") {
          setFilteredPokemon(pokemonList);
          return;
        }

        setLoading(true);
        try {
          const res = await axios.get(
            "https://pokeapi.co/api/v2/pokemon?limit=10000"
          );
          const allResults = res.data.results;

          const matchingResults = allResults.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          const detailedPromises = matchingResults.map((p) => axios.get(p.url));
          const detailedResults = await Promise.all(detailedPromises);

          const detailedList = detailedResults.map((res) => {
            const data = res.data;
            return {
              id: data.id,
              name: data.name,
              image: data.sprites.front_default,
              type: data.types[0].type.name,
              damage: data.stats[2].base_stat,
              attacks: data.abilities.map((a) => a.ability.name),
              health: data.stats[1].base_stat,
              speed: data.stats.find((s) => s.stat.name === "speed").base_stat,
              friendly: data.base_experience,
              url: `https://pokeapi.co/api/v2/pokemon/${data.id}/`,
            };
          });

          setFilteredPokemon(detailedList);
        } catch (error) {
          console.error("Failed to search Pokémon:", error);
        }
        setLoading(false);
      };

      fetchAndFilterAllPokemon();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, pokemonList]);

  const fetchPokemonDetails = async (url) => {
    const res = await axios.get(url);
    setSelectedPokemon(res.data);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "electric":
        return "bg-yellow-500";
      case "water":
        return "bg-cyan-800";
      case "fire":
        return "bg-red-700";
      case "grass":
        return "bg-green-700";
      case "dragon":
        return "bg-red-900";
      case "steel":
        return "bg-gray-500";
      case "psychic":
        return "bg-pink-700";
      case "fairy":
        return "bg-pink-400";
      case "ghost":
        return "bg-purple-400";
      case "bug":
        return "bg-yellow-800";
      case "poison":
        return "bg-violet-700";
      case "flying":
        return "bg-blue-500";
      default:
        return "bg-yellow-600";
    }
  };

  const goToPage = (pageNum) => {
    const offset = (pageNum - 1) * 20;
    const url = `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`;
    fetchPokemonList(url);
  };

  const handleAddToTeam = async () => {
    if (!selectedPokemon || adding) return;
    setAdding(true);

    try {
      if (team.length >= 6) {
        alert("Your team is full! Max of 6 Pokémon.");
        return;
      }

      const isPokemonInTeam = team.some(
        (member) => member.pokeId === selectedPokemon.id
      );
      if (isPokemonInTeam) {
        alert("This Pokémon is already in your team.");
        setAdding(false);
        return;
      }

      const newMember = {
        pokeId: selectedPokemon.id, // store original Pokémon ID here
        name: selectedPokemon.name,
        image: selectedPokemon.sprites.front_default,
        type: selectedPokemon.types[0].type.name,
        health: selectedPokemon.stats[1].base_stat,
        damage: selectedPokemon.stats[2].base_stat,
        speed: selectedPokemon.stats.find((s) => s.stat.name === "speed").base_stat,
        abilities: selectedPokemon.abilities.map((a) => a.ability.name),
      };

      const res = await axios.post(API_URL, newMember);
      setTeam((prev) => [...prev, res.data]);
    } catch (error) {
      console.error("Failed to add to team:", error);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    const fetchTeam = async () => {
      const res = await axios.get(API_URL);
      setTeam(res.data);
    };
    fetchTeam();
  }, []);

  const handleRemoveFromTeam = async (id) => {
    try {
      await fetch(`https://pokemonsimulator.onrender.com/team/${id}`, {
        method: "DELETE",
      });

      setTeam((prevTeam) => prevTeam.filter((member) => member.id !== id));
    } catch (error) {
      console.error("Failed to remove Pokémon from team:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 bg-gray-100 z-1">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/battleground1.png')] z-0"></div>

      {/* Left Side */}
      <div
  className="z-100 w-full max-h-[calc(100vh-52px)] overflow-y-scroll hide-scrollbar border border-white/20 p-4 bg-white/10 backdrop-blur-md shadow-xl rounded-xl"
  style={{ maxHeight: "calc(100vh - 52px)" }}
>

        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4 text-black">Pokedex</h2>
          <button
            type="button"
            onClick={() => setShowTeamModal(true)}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            Show team
          </button>
        </div>

        {/* Search Bar */}
        <div className="sticky top-0 z-10 p-2">
          <input
            type="text"
            placeholder="Search for Pokémon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded border border-white bg-white/20 text-white placeholder-white/80 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">

          {filteredPokemon.map((pokemon, index) => (
            <div
              key={index}
              onClick={() => fetchPokemonDetails(pokemon.url)}
              className="rounded-2xl overflow-hidden shadow-xl cursor-pointer hover:scale-105 transition-transform bg-white border-4 border-yellow-300 w-full max-w-xs mx-auto font-poppins"
            >
              {/* Top Section with Type */}
              <div
                className={`h-44 flex items-center justify-center relative ${getTypeColor(
                  pokemon.type
                )} bg-opacity-90`}
              >
                {/* Type Badge */}
                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                  {pokemon.type.charAt(0).toUpperCase() + pokemon.type.slice(1)}
                </span>

                {/* Pokémon Image */}
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="h-28 drop-shadow-md transition-transform duration-200"
                />
              </div>

              {/* Bottom Info Section */}
              <div className="bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 p-4">
                {/* Name */}
                <h3 className="text-xl font-bold text-center mb-3 tracking-wide uppercase">
                  {pokemon.name}
                </h3>

                {/* Stats */}
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-semibold text-yellow-700">
                      Damage:
                    </span>{" "}
                    {pokemon.damage}
                  </p>
                  <p>
                    <span className="font-semibold text-green-700">
                      Health:
                    </span>{" "}
                    {pokemon.health}
                  </p>

                  <p>
                    <span className="font-semibold text-blue-700">Speed:</span>{" "}
                    {pokemon.speed}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between mt-6 items-center gap-4">
          <button
            disabled={!prevUrl || loading}
            onClick={() => fetchPokemonList(prevUrl)}
            className="px-4 py-2 bg-white/20 text-white border border-white rounded hover:bg-white/30 transition disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(currentPage - page) <= 2
              )
              .map((page, index, arr) => {
                const isDots = index > 0 && page - arr[index - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {isDots && <span className="px-2 text-white">...</span>}
                    <button
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded ${
                        page === currentPage
                          ? "bg-white text-black font-bold"
                          : "bg-white/20 text-white hover:bg-white/30"
                      } border border-white transition`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            disabled={!nextUrl || loading}
            onClick={() => fetchPokemonList(nextUrl)}
            className="px-4 py-2 bg-white/20 text-white border border-white rounded hover:bg-white/30 transition disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

 {/* Right Side */}
{selectedPokemon ? (
  <div className="z-100 mt-10 fixed inset-0 bg-black/50 flex justify-center items-center">
    <div className="p-6 rounded-2xl shadow-2xl border-4 border-yellow-300 bg-gradient-to-br from-yellow-100 via-white to-yellow-50 w-90 text-center relative font-poppins">
      {/* Pokémon Number */}
      <div className="absolute top-2 left-2 text-sm text-gray-600 font-semibold">
        #{selectedPokemon.id.toString().padStart(3, "0")}
      </div>

      {/* Name */}
      <h2 className="text-3xl font-extrabold text-gray-800 mb-2 uppercase tracking-wide">
        {selectedPokemon.name}
      </h2>

      {/* Type(s) */}
      <div className="mb-3 flex justify-center space-x-2">
        {selectedPokemon.types.map((t, idx) => (
          <span
            key={idx}
            className={`text-xs font-semibold px-3 py-1 rounded-full text-white shadow ${getTypeColor(
              t.type.name
            )}`}
          >
            {t.type.name}
          </span>
        ))}
      </div>

      {/* Sprite */}
      <img
        src={selectedPokemon.sprites.front_default}
        alt={selectedPokemon.name}
        className="w-48 h-48 mx-auto mb-4 drop-shadow-lg"
      />

      {/* Stats */}
      <div className="space-y-3 text-left">
        {/* Health */}
        <div className="flex items-center space-x-2">
          <span className="w-20 font-bold text-red-700">Health:</span>
          <div className="flex-1 bg-gray-200 rounded h-3 relative">
            <div
              className="bg-green-500 h-3 rounded"
              style={{
                width: `${Math.min(
                  selectedPokemon.stats[1].base_stat,
                  100
                )}%`,
              }}
            ></div>
          </div>
          <span className="w-10 text-right text-gray-700 font-semibold">
            {selectedPokemon.stats[1].base_stat}
          </span>
        </div>

        {/* Damage */}
        <div className="flex items-center space-x-2">
          <span className="w-20 font-bold text-yellow-700">Damage:</span>
          <div className="flex-1 bg-gray-200 rounded h-3 relative">
            <div
              className="bg-red-500 h-3 rounded"
              style={{
                width: `${Math.min(
                  selectedPokemon.stats[2].base_stat,
                  100
                )}%`,
              }}
            ></div>
          </div>
          <span className="w-10 text-right text-gray-700 font-semibold">
            {selectedPokemon.stats[2].base_stat}
          </span>
        </div>

        {/* Speed */}
        <div className="flex items-center space-x-2">
          <span className="w-20 font-bold text-blue-700">Speed:</span>
          <div className="flex-1 bg-gray-200 rounded h-3 relative">
            <div
              className="bg-blue-400 h-3 rounded"
              style={{
                width: `${Math.min(
                  selectedPokemon.stats.find(
                    (s) => s.stat.name === "speed"
                  ).base_stat,
                  100
                )}%`,
              }}
            ></div>
          </div>
          <span className="w-10 text-right text-gray-700 font-semibold">
            {
              selectedPokemon.stats.find((s) => s.stat.name === "speed")
                .base_stat
            }
          </span>
        </div>

        {/* Abilities */}
        <div className="text-sm text-gray-800 mt-2">
          <strong>Abilities:</strong>{" "}
          {selectedPokemon.abilities
            .map((a) => a.ability.name.replace("-", " "))
            .join(", ")}
        </div>
      </div>

      {/* Button */}
      <button
        type="button"
        className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white font-bold rounded-full shadow-md disabled:opacity-50"
        onClick={handleAddToTeam}
        disabled={adding}
      >
        {adding ? "Adding..." : "Add to Team"}
      </button>

      {/* Close Button */}
      <button
        onClick={() => setSelectedPokemon(null)}
        className="absolute top-2 right-2 text-white text-xl"
      >
        ✖
      </button>
    </div>
  </div>
) : (
  <div>
   
  </div>
)}

        {showTeamModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-100">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative h-auto">
              <button
                onClick={() => setShowTeamModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
              <h2 className="text-xl font-bold mb-4">Your Team</h2>
              <ul className="space-y-4 max-h-64 overflow-y-auto">
                {team.length === 0 ? (
                  <p className="text-sm text-gray-500">No Pokémon in team.</p>
                ) : (
                  team.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between border p-2 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-10 h-10"
                        />
                        <span className="capitalize font-medium">
                          {member.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFromTeam(member.id)}
                        className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
    </div>
  );
}
