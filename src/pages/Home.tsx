import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import HeroBanner from "@/components/HeroBanner";
import AnimeCard from "@/components/AnimeCard";
import SectionTitle from "@/components/SectionTitle";
import { SkeletonCard } from "@/components/LoadingSpinner";
import { Clock, TrendingUp, Flame, CheckCircle2, Zap } from "lucide-react";
import { Link } from "react-router";
import { } from "react";

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
