import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Link } from "react-router";
import { Compass, Tag, RefreshCw } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

const genreColors: string[] = [
  "from-red-600/20 to-red-800/10 border-red-500/30",
  "from-green-600/20 to-green-800/10 border-green-500/30",
  "from-yellow-600/20 to-yellow-800/10 border-yellow-500/30",
  "from-purple-600/20 to-purple-800/10 border-purple-500/30",
  "from-blue-600/20 to-blue-800/10 border-blue-500/30",
  "from-pink-600/20 to-pink-800/10 border-pink-500/30",
  "from-cyan-600/20 to-cyan-800/10 border-cyan-500/30",
  "from-indigo-600/20 to-indigo-800/10 border-indigo-500/30",
  "from-orange-600/20 to-orange-800/10 border-orange-500/30",
  "from-emerald-600/20 to-emerald-800/10 border-emerald-500/30",
  "from-violet-600/20 to-violet-800/10 border-violet-500/30",
  "from-teal-600/20 to-teal-800/10 border-teal-500/30",
  "from-amber-600/20 to-amber-800/10 border-amber-500/30",
  "from-rose-600/20 to-rose-800/10 border-rose-500/30",
  "from-fuchsia-600/20 to-fuchsia-800/10 border-fuchsia-500/30",
];

export default function Genres() {
  const { data, isLoading, error, refetch } = trpc.anime.genres.useQuery();
  const genres = (data as any[]) || [];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold">Daftar Genre</h1>
          {!isLoading && (
            <button
              onClick={() => refetch()}
              className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-16">
            <Compass className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">Gagal memuat genre</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : genres.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {genres.map((genre: any, i: number) => {
              const id = String(genre.genreId || genre.slug || genre.id || i);
              const name = String(genre.title || genre.name || genre.label || id);
              return (
                <Link key={`${id}-${i}`} to={`/genre/${id}`}>
                  <div
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl bg-gradient-to-br ${genreColors[i % genreColors.length]} border hover:scale-[1.02] active:scale-[0.98] transition-transform`}
                  >
                    <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-200 truncate">
                      {name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Compass className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">Genre tidak tersedia</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
