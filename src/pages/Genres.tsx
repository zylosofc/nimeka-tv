import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Link } from "react-router";
import { Compass, Tag } from "lucide-react";
import { motion } from "framer-motion";

const genreColors: Record<string, string> = {
  action: "from-red-600/20 to-red-800/10 border-red-500/20",
  adventure: "from-green-600/20 to-green-800/10 border-green-500/20",
  comedy: "from-yellow-600/20 to-yellow-800/10 border-yellow-500/20",
  drama: "from-purple-600/20 to-purple-800/10 border-purple-500/20",
  fantasy: "from-blue-600/20 to-blue-800/10 border-blue-500/20",
  horror: "from-gray-600/20 to-gray-800/10 border-gray-500/20",
  romance: "from-pink-600/20 to-pink-800/10 border-pink-500/20",
  scifi: "from-cyan-600/20 to-cyan-800/10 border-cyan-500/20",
  "sci-fi": "from-cyan-600/20 to-cyan-800/10 border-cyan-500/20",
  mystery: "from-indigo-600/20 to-indigo-800/10 border-indigo-500/20",
  thriller: "from-orange-600/20 to-orange-800/10 border-orange-500/20",
  sports: "from-emerald-600/20 to-emerald-800/10 border-emerald-500/20",
  music: "from-violet-600/20 to-violet-800/10 border-violet-500/20",
  school: "from-teal-600/20 to-teal-800/10 border-teal-500/20",
  shounen: "from-amber-600/20 to-amber-800/10 border-amber-500/20",
  seinen: "from-slate-600/20 to-slate-800/10 border-slate-500/20",
  sliceoflife: "from-rose-600/20 to-rose-800/10 border-rose-500/20",
  supernatural: "from-fuchsia-600/20 to-fuchsia-800/10 border-fuchsia-500/20",
};

function getGenreColor(genreId: string): string {
  return (
    genreColors[genreId] ||
    "from-gray-600/20 to-gray-800/10 border-gray-500/20"
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Genres() {
  const { data, isLoading } = trpc.anime.genres.useQuery();

  const genres = data as any[];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <Compass className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold">Daftar Genre</h1>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : genres && genres.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {genres.map((genre: any, i: number) => (
              <Link key={genre.genreId} to={`/genre/${genre.genreId}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${getGenreColor(
                    genre.genreId
                  )} border hover:scale-[1.02] transition-transform`}
                >
                  <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-200">
                    {genre.title}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Compass className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Genre tidak tersedia</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
