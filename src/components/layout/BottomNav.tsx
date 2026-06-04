import { Link, useLocation } from "react-router";
import { Home, Search, Calendar, Tv, Compass } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", label: "Beranda", icon: Home },
  { path: "/search", label: "Cari", icon: Search },
  { path: "/schedule", label: "Jadwal", icon: Calendar },
  { path: "/anime", label: "Anime", icon: Tv },
  { path: "/genres", label: "Genre", icon: Compass },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-lg border-t border-white/10 md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute -top-0.5 w-8 h-0.5 bg-purple-500 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-purple-400" : "text-gray-500"
                }`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] mt-0.5 transition-colors ${
                  isActive ? "text-purple-400 font-medium" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
