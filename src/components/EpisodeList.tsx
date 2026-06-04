import { Link } from "react-router";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

interface Episode {
  title: string;
  eps: number;
  date: string;
  episodeId: string;
  href: string;
}

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeId?: string;
}

export default function EpisodeList({ episodes, currentEpisodeId }: EpisodeListProps) {
  return (
    <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
      {episodes.map((ep, i) => {
        const isActive = currentEpisodeId === ep.episodeId;
        return (
          <Link key={ep.episodeId} to={`/watch/${ep.episodeId}`}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-purple-600/20 border border-purple-500/40"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive ? "bg-purple-600" : "bg-gray-800"
                }`}
              >
                <Play className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} fill={isActive ? "white" : "none"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isActive ? "text-purple-300 font-medium" : "text-gray-300"}`}>
                  Episode {ep.eps}
                </p>
                <p className="text-[10px] text-gray-500">{ep.date}</p>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
