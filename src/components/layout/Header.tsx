import { Link, useNavigate } from "react-router";
import { Search, Menu, Tv } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-lg border-b border-white/10">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Tv className="w-6 h-6 text-purple-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Nimeka TV
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Beranda</Link>
          <Link to="/anime?filter=ongoing" className="text-sm text-gray-300 hover:text-white transition-colors">Ongoing</Link>
          <Link to="/anime?filter=completed" className="text-sm text-gray-300 hover:text-white transition-colors">Completed</Link>
          <Link to="/schedule" className="text-sm text-gray-300 hover:text-white transition-colors">Jadwal</Link>
          <Link to="/genres" className="text-sm text-gray-300 hover:text-white transition-colors">Genre</Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/search")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-300" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors md:hidden"
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a1a2e] border-t border-white/10 px-4 py-3 space-y-2">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Beranda</Link>
          <Link to="/anime?filter=ongoing" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Anime Ongoing</Link>
          <Link to="/anime?filter=completed" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Anime Completed</Link>
          <Link to="/schedule" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Jadwal Rilis</Link>
          <Link to="/genres" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Daftar Genre</Link>
        </div>
      )}
    </header>
  );
}
