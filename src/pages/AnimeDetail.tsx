import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Play, Star, Calendar, Clock, Building2, Film, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AnimeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.anime.detail.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const anime = data as any;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-white">
        <Header />
        <LoadingSpinner size="lg" />
        <BottomNav />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-white">
        <Header />
        <div className="text-center py-16">
          <p className="text-gray-500">Anime tidak ditemukan</p>
          <Link to="/" className="text-purple-400 hover:underline mt-2 inline-block">
            Kembali ke Beranda
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      {/* Banner */}
      <div className="relative h-[200px] sm:h-[280px] overflow-hidden">
        <img
          src={anime.poster}
          alt={anime.title}
          className="w-full h-full object-cover blur-sm opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/50 to-transparent" />
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-sm text-white hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster & Quick Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 w-[160px] sm:w-[200px] mx-auto md:mx-0"
          >
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-white/10">
              <img
                src={anime.poster}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Watch First Episode Button */}
            {anime.episodeList?.length > 0 && (
              <Link
                to={`/watch/${anime.episodeList[anime.episodeList.length - 1].episodeId}`}
                className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" fill="white" />
                Tonton Episode Terbaru
              </Link>
            )}

            {anime.batch && (
              <Link
                to={`/batch/${anime.batch}`}
                className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-2 bg-pink-600/80 hover:bg-pink-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Film className="w-4 h-4" />
                Download Batch
              </Link>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{anime.title}</h1>
            {anime.japanese && (
              <p className="text-sm text-gray-400 mb-3">{anime.japanese}</p>
            )}

            {/* Score & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {anime.score && (
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {anime.score}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md">
                {anime.status}
              </span>
              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md">
                {anime.type}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              {anime.episodes > 0 && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Film className="w-4 h-4 text-gray-500" />
                  <span>{anime.episodes} Episode</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{anime.duration}</span>
                </div>
              )}
              {anime.aired && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{anime.aired}</span>
                </div>
              )}
              {anime.studios && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span>{anime.studios}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {anime.genreList?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genreList.map((g: any) => (
                  <Link
                    key={g.genreId}
                    to={`/genre/${g.genreId}`}
                    className="text-xs px-3 py-1 bg-white/5 text-gray-300 rounded-lg hover:bg-purple-600/30 hover:text-purple-300 transition-colors border border-white/5"
                  >
                    {g.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis?.paragraphs?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Sinopsis</h3>
                <div className="text-sm text-gray-400 leading-relaxed space-y-2">
                  {anime.synopsis.paragraphs.map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Episodes */}
        {anime.episodeList?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-lg font-bold mb-3">Daftar Episode</h2>
            <div className="bg-[#1a1a2e] rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {[...anime.episodeList].reverse().map((ep: any) => (
                  <Link key={ep.episodeId} to={`/watch/${ep.episodeId}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 transition-colors">
                        <Play className="w-4 h-4 text-purple-400 group-hover:text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                          Episode {ep.eps}
                        </p>
                        <p className="text-[10px] text-gray-500">{ep.date}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Recommendations */}
        {anime.recommendedAnimeList?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 mb-8"
          >
            <h2 className="text-lg font-bold mb-3">Rekomendasi Anime</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {anime.recommendedAnimeList.map((a: any, i: number) => (
                <AnimeCard
                  key={a.animeId}
                  anime={a}
                  index={i}
                  variant="small"
                />
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
