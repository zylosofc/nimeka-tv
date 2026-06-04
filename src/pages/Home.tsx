import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import HeroBanner from "@/components/HeroBanner";
import AnimeCard from "@/components/AnimeCard";
import SectionTitle from "@/components/SectionTitle";
import { SkeletonCard } from "@/components/LoadingSpinner";
import { Flame, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router";

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
