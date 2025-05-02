import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./assets/components/navigation";
import Home from "./assets/components/home";
import Pokedex from "./assets/components/pokedex";
import Team from "./assets/components/team";
import Arena from "./assets/components/arena";
import History from "./assets/components/history";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/team" element={<Team />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
