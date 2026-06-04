import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import HeroBanner from "@/components/HeroBanner";
import AnimeCard from "@/components/AnimeCard";
import SectionTitle from "@/components/SectionTitle";
import { SkeletonCard } from "@/components/LoadingSpinner";
import { Flame, Clock, TrendingUp, History, Play, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { getWatchHistory, clearHistory, type WatchHistoryItem } from "@/hooks/useWatchHistory";
import { useState, useEffect } from "react";

interface AnimeItem {
  title: string;
  poster: string;
  animeId: string;
  href: string;
  episodes?: number;
  score?: string;
  status?: string;
  releaseDay?: string;
  type?: string;
  latestReleaseDate?: string;
}

function formatProgress(seconds: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function RecentlyWatched() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getWatchHistory());
  }, []);

  if (history.length === 0) return null;

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Terakhir Ditonton</h2>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Hapus
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {history.slice(0, 10).map((item) => (
          <button
            key={item.episodeId}
            onClick={() => navigate(`/watch/${item.episodeId}`)}
            className="block w-[130px] flex-shrink-0 text-left group"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800">
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.animeTitle}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <Play className="w-8 h-8 text-gray-600" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Play overlay on hover */}
              <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>

              {/* Episode badge */}
              <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 bg-purple-600 text-white rounded font-medium">
                EP {item.episodeNumber}
              </span>

              {/* Progress bar */}
              {item.progressSeconds > 0 && (
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="mx-1.5 mb-1.5">
                    <div className="flex justify-end mb-0.5">
                      <span className="text-[9px] text-white/70">{formatProgress(item.progressSeconds)}</span>
                    </div>
                    {/* Progress bar visual - kita tunjukkan ada progress tanpa tau total durasi */}
                    <div className="h-0.5 bg-white/20 rounded-full">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, (item.progressSeconds / (23 * 60)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <h3 className="mt-1.5 text-[11px] text-gray-200 line-clamp-2 leading-tight font-medium group-hover:text-purple-400 transition-colors">
              {item.animeTitle}
            </h3>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { data: ongoingList, isLoading: ongoingLoading } = trpc.anime.home.useQuery();

  const ongoing: AnimeItem[] = (ongoingList as AnimeItem[])?.slice(0, 15) || [];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* Hero Banner */}
        {ongoingLoading ? (
          <div className="w-full h-[280px] sm:h-[340px] rounded-2xl bg-gray-800 animate-pulse mb-6" />
        ) : (
          <HeroBanner animeList={ongoing} />
        )}

        {/* Terakhir Ditonton */}
        <RecentlyWatched />

        {/* Ongoing Anime Section */}
        <section className="mb-8">
          <SectionTitle
            title="Anime Ongoing"
            to="/anime?filter=ongoing"
          />
          {ongoingLoading ? (
            <SkeletonCard count={6} />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {ongoing.map((anime: AnimeItem, i: number) => (
                <AnimeCard key={anime.animeId} anime={anime} index={i} variant="grid" />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-3">
            <Link
              to="/schedule"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-800/10 border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              <Clock className="w-6 h-6 text-purple-400" />
              <span className="text-xs font-medium text-gray-300">Jadwal Rilis</span>
            </Link>
            <Link
              to="/anime?filter=completed"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-pink-600/20 to-pink-800/10 border border-pink-500/20 hover:border-pink-500/40 transition-all"
            >
              <TrendingUp className="w-6 h-6 text-pink-400" />
              <span className="text-xs font-medium text-gray-300">Anime Tamat</span>
            </Link>
            <Link
              to="/genres"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 hover:border-blue-500/40 transition-all"
            >
              <Flame className="w-6 h-6 text-blue-400" />
              <span className="text-xs font-medium text-gray-300">Jelajahi Genre</span>
            </Link>
          </div>
        </section>

        {/* More Ongoing - Grid Layout */}
        <section className="mb-8">
          <SectionTitle title="Sedang Tayang" to="/anime?filter=ongoing" />
          {ongoingLoading ? (
            <SkeletonCard count={6} />
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
              {ongoing.slice(5, 17).map((anime: AnimeItem, i: number) => (
                <AnimeCard key={anime.animeId} anime={anime} index={i} variant="grid" />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-xs text-gray-500">
          <p>Nimeka TV - Nonton Anime Subtitle Indonesia Gratis</p>
          <p className="mt-1">Powered by Hiyori Senpaii</p>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
