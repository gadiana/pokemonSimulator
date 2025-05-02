import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route) => path === route;

  const linkClass = (route) =>
    `transition font-bold ${
      isActive(route) ? 'text-yellow-300' : 'text-white hover:text-yellow-300'
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full h-[52px] bg-orange-600 shadow-md flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <img src="/pokemonLogo.png" alt="Pikachu" className="h-8 w-auto" />
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-10">
        <Link to="/" className={linkClass('/')}>Home</Link>
        <Link to="/pokedex" className={linkClass('/pokedex')}>Pokedex</Link>
        <Link to="/team" className={linkClass('/team')}>Team</Link>
        <Link to="/arena" className={linkClass('/arena')}>Arena</Link>
        <Link to="/history" className={linkClass('/history')}>History</Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-[52px] left-0 w-full bg-orange-600 shadow-md flex flex-col items-center gap-4 py-4 z-40 md:hidden">
          <Link to="/" onClick={() => setIsOpen(false)} className={linkClass('/')}>Home</Link>
          <Link to="/pokedex" onClick={() => setIsOpen(false)} className={linkClass('/pokedex')}>Pokedex</Link>
          <Link to="/team" onClick={() => setIsOpen(false)} className={linkClass('/team')}>Team</Link>
          <Link to="/arena" onClick={() => setIsOpen(false)} className={linkClass('/arena')}>Arena</Link>
          <Link to="/history" onClick={() => setIsOpen(false)} className={linkClass('/history')}>History</Link>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
