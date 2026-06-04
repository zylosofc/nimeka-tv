import { Link } from "react-router";
import { Play, Star } from "lucide-react";
import { motion } from "framer-motion";

interface AnimeCardProps {
  anime: {
    title: string;
    poster: string;
    animeId: string;
    href: string;
    episodes?: number;
    score?: string;
    status?: string;
    releaseDay?: string;
    type?: string;
  };
  index?: number;
  variant?: "default" | "small" | "schedule";
}

export default function AnimeCard({ anime, index = 0, variant = "default" }: AnimeCardProps) {
  if (variant === "schedule") {
    return (
      <Link to={`/anime/${anime.animeId}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden">
            <img
              src={anime.poster}
              alt={anime.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <h4 className="text-sm text-gray-200 font-medium line-clamp-2 leading-tight">
              {anime.title}
            </h4>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                {anime.status || "Ongoing"}
              </span>
              {anime.score && (
                <span className="flex items-center gap-0.5 text-[10px] text-yellow-400">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  {anime.score}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  if (variant === "small") {
    return (
      <Link to={`/anime/${anime.animeId}`} className="block w-[110px] flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.04 }}
        >
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 group">
            <img
              src={anime.poster}
              alt={anime.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
            {anime.episodes !== undefined && (
              <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 bg-purple-600 text-white rounded font-medium">
                EP {anime.episodes}
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-xs text-gray-300 line-clamp-2 leading-tight font-medium">
            {anime.title}
          </h3>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/anime/${anime.animeId}`} className="block w-[140px] sm:w-[160px] flex-shrink-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800 group shadow-lg">
          <img
            src={anime.poster}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          {anime.episodes !== undefined && (
            <span className="absolute top-2 left-2 text-xs px-2 py-0.5 bg-purple-600 text-white rounded-md font-medium">
              EP {anime.episodes}
            </span>
          )}
          {anime.releaseDay && (
            <span className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded">
              {anime.releaseDay}
            </span>
          )}
        </div>
        <h3 className="mt-2 text-sm text-gray-200 line-clamp-2 leading-tight font-medium group-hover:text-purple-400 transition-colors">
          {anime.title}
        </h3>
        {anime.score && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-400">{anime.score}</span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
