import { Link } from "react-router";
import { Play, Star, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface HeroAnime {
  title: string;
  poster: string;
  animeId: string;
  href: string;
  episodes?: number;
  score?: string;
  releaseDay?: string;
  status?: string;
  latestReleaseDate?: string;
}

interface HeroBannerProps {
  animeList: HeroAnime[];
}

export default function HeroBanner({ animeList }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (animeList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % Math.min(animeList.length, 5));
    }, 5000);
    return () => clearInterval(timer);
  }, [animeList.length]);

  if (animeList.length === 0) return null;

  const featured = animeList[current];

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[420px] rounded-2xl overflow-hidden mb-6">
      {/* Background */}
      <motion.img
        key={featured.animeId}
        src={featured.poster}
        alt={featured.title}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f1a]/90 via-[#0f0f1a]/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
        <motion.div
          key={featured.animeId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-purple-600 text-white rounded-md font-medium">
              {featured.status || "Ongoing"}
            </span>
            {featured.episodes && (
              <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded-md">
                {featured.episodes} Episode
              </span>
            )}
            {featured.releaseDay && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded-md">
                <Calendar className="w-3 h-3" />
                {featured.releaseDay}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 max-w-xl line-clamp-2">
            {featured.title}
          </h2>
          <div className="flex items-center gap-3 mb-3">
            {featured.score && (
              <span className="flex items-center gap-1 text-sm text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400" />
                {featured.score}
              </span>
            )}
            {featured.latestReleaseDate && (
              <span className="text-xs text-gray-400">
                Update: {featured.latestReleaseDate}
              </span>
            )}
          </div>
          <Link
            to={`/anime/${featured.animeId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" fill="white" />
            Tonton Sekarang
          </Link>
        </motion.div>

        {/* Dots indicator */}
        {animeList.length > 1 && (
          <div className="flex items-center gap-1.5 mt-4">
            {animeList.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-6 bg-purple-500" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
