import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/pokedex");
  };

  return (
    <div className="relative flex flex-col flex-grow bg-white w-full px-4 justify-center items-center overflow-hidden min-h-[calc(100vh-52px)]">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/battleground1.png')] z-0"></div>

      {/* Left Image */}
      <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-1/2 h-full bg-no-repeat bg-contain bg-center bg-[url('/typlosion.png')] pointer-events-none"></div>

      {/* Right Image */}
      <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 h-full bg-no-repeat bg-contain bg-center bg-[url('/cubone.svg')]"></div>

      {/* Title */}
      <h1
        className="z-[100] text-yellow-300 uppercase font-extrabold poetsen-one-regular text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center
          [text-shadow:_2px_2px_2px_rgba(0,0,0,0.5)] 
          [text-stroke:_2px_black] 
          [-webkit-text-stroke:_2px_black]"
      >
        Pokemon Battle
      </h1>

      {/* Button */}
      <button
        onClick={handleGetStarted}
        className="z-[100] mt-6 px-6 py-2 text-lg sm:text-xl md:text-2xl bg-green-800 text-white rounded-full shadow-xl hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
      >
        Get Started
      </button>
    </div>
  );
}

export default Home;
