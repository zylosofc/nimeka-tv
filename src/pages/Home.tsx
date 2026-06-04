import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import HeroBanner from "@/components/HeroBanner";
import AnimeCard from "@/components/AnimeCard";
import SectionTitle from "@/components/SectionTitle";
import { SkeletonCard } from "@/components/LoadingSpinner";
import { Clock, TrendingUp, Flame, History, Play, RotateCcw, CheckCircle2, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { getWatchHistory, clearHistory, type WatchHistoryItem } from "@/hooks/useWatchHistory";
import { useState, useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
}

function formatProgress(seconds: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Proxy gambar lewat backend kita supaya tidak kena CORS di mobile
function proxyImg(url: string): string {
  if (!url) return "";
  return `/api/imgproxy?url=${encodeURIComponent(url)}`;
}

function RecentlyWatched() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getWatchHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Terakhir Ditonton</h2>
        </div>
        <button
          onClick={() => { clearHistory(); setHistory([]); }}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />Hapus
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {history.slice(0, 10).map((item) => (
          <button
            key={item.episodeId}
            onClick={() => navigate(`/watch/${item.episodeId}`)}
            className="block w-[110px] flex-shrink-0 text-left group"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#1a1a2e]">
              {item.poster ? (
                <img
                  src={proxyImg(item.poster)}
                  alt={item.animeTitle}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              ) : null}
              {/* Fallback selalu ada di belakang, muncul bila img gagal/kosong */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/50 to-[#1a1a2e] ${item.poster ? "opacity-0" : "opacity-100"}`} aria-hidden>
                <Play className="w-7 h-7 text-purple-400 mb-1" />
                <span className="text-[9px] text-gray-400 text-center px-2 line-clamp-2 leading-tight">{item.animeTitle}</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Play on hover */}
              <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>

              {/* EP badge */}
              <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 bg-purple-600 text-white rounded font-medium z-10">
                EP {item.episodeNumber}
              </span>

              {/* Progress bar */}
              {item.progressSeconds > 0 && (
                <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 z-10">
                  <div className="flex justify-end mb-0.5">
                    <span className="text-[9px] text-white/60">{formatProgress(item.progressSeconds)}</span>
                  </div>
                  <div className="h-0.5 bg-white/20 rounded-full">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (item.progressSeconds / (23 * 60)) * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
            <h3 className="mt-1.5 text-[10px] text-gray-300 line-clamp-2 leading-tight font-medium group-hover:text-purple-400 transition-colors">
              {item.animeTitle}
            </h3>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { data: homeData, isLoading } = trpc.anime.home.useQuery();

  const data = homeData as any;
  const ongoing: AnimeItem[] = data?.ongoing?.slice(0, 15) || [];
  const completed: AnimeItem[] = data?.completed?.slice(0, 10) || [];
  const newUpdate: AnimeItem[] = data?.newUpdate?.slice(0, 12) || [];
  const hot: AnimeItem[] = data?.hot?.slice(0, 10) || [];
  const heroList = (newUpdate.length > 0 ? newUpdate : ongoing).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">

        {/* Hero */}
        {isLoading ? (
          <div className="w-full h-[260px] sm:h-[340px] rounded-2xl bg-[#1a1a2e] animate-pulse mb-6" />
        ) : (
          <HeroBanner animeList={heroList} />
        )}

        {/* Terakhir Ditonton */}
        <RecentlyWatched />

        {/* Update Terbaru */}
        {(isLoading || newUpdate.length > 0) && (
          <section className="mb-8">
            <SectionTitle title="Update Terbaru" icon={<Zap className="w-4 h-4 text-yellow-400" />} to="/anime?filter=ongoing" />
            {isLoading ? <SkeletonCard count={6} /> : (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {newUpdate.map((anime: AnimeItem, i: number) => (
                  <AnimeCard key={anime.animeId || i} anime={anime} index={i} variant="default" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Hot Anime */}
        {(isLoading || hot.length > 0) && (
          <section className="mb-8">
            <SectionTitle title="Hot Anime" icon={<Flame className="w-4 h-4 text-orange-400" />} to="/anime" />
            {isLoading ? <SkeletonCard count={6} /> : (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {hot.map((anime: AnimeItem, i: number) => (
                  <AnimeCard key={anime.animeId || i} anime={anime} index={i} variant="default" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-3">
            <Link to="/schedule" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-800/10 border border-purple-500/20 hover:border-purple-500/40 active:scale-95 transition-all">
              <Clock className="w-6 h-6 text-purple-400" />
              <span className="text-xs font-medium text-gray-300">Jadwal</span>
            </Link>
            <Link to="/anime?filter=completed" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-pink-600/20 to-pink-800/10 border border-pink-500/20 hover:border-pink-500/40 active:scale-95 transition-all">
              <CheckCircle2 className="w-6 h-6 text-pink-400" />
              <span className="text-xs font-medium text-gray-300">Tamat</span>
            </Link>
            <Link to="/search" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 hover:border-blue-500/40 active:scale-95 transition-all">
              <Flame className="w-6 h-6 text-blue-400" />
              <span className="text-xs font-medium text-gray-300">Genre</span>
            </Link>
          </div>
        </section>

        {/* Ongoing Grid */}
        <section className="mb-8">
          <SectionTitle title="Anime Ongoing" icon={<TrendingUp className="w-4 h-4 text-purple-400" />} to="/anime?filter=ongoing" />
          {isLoading ? <SkeletonCard count={9} /> : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
              {ongoing.map((anime: AnimeItem, i: number) => (
                <AnimeCard key={anime.animeId || i} anime={anime} index={i} variant="grid" />
              ))}
            </div>
          )}
        </section>

        {/* Completed */}
        {(isLoading || completed.length > 0) && (
          <section className="mb-8">
            <SectionTitle title="Anime Selesai" icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} to="/anime?filter=completed" />
            {isLoading ? <SkeletonCard count={6} /> : (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {completed.map((anime: AnimeItem, i: number) => (
                  <AnimeCard key={anime.animeId || i} anime={anime} index={i} variant="default" />
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="text-center py-8 text-xs text-gray-500 border-t border-white/5">
          <p>Nimeka TV · Nonton Anime Sub Indo Gratis</p>
          <p className="mt-1">Powered by Hiyori Senpaii</p>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
