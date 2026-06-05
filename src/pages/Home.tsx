import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import HeroBanner from "@/components/HeroBanner";
import AnimeCard from "@/components/AnimeCard";
import SectionTitle from "@/components/SectionTitle";
import { SkeletonCard, SkeletonGrid } from "@/components/LoadingSpinner";
import { Flame, Clock, TrendingUp, History, Play } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";

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

interface WatchHistoryItem {
  animeId: string;
  title: string;
  poster: string;
  episodeId: string;
  episodeNum: string | number;
  watchedAt: number;
}

function useWatchHistory(): WatchHistoryItem[] {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nimeka_watch_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  return history;
}

export default function Home() {
  const { data: homeData, isLoading: ongoingLoading } = trpc.anime.home.useQuery();
  const watchHistory = useWatchHistory();

  // home API returns { ongoing, completed, newUpdate, hot }
  const homeObj = homeData as any;
  const ongoing: AnimeItem[] = homeObj?.ongoing || [];
  const newEps: AnimeItem[] = homeObj?.newUpdate || [];
  const popular: AnimeItem[] = homeObj?.hot || [];
  const completed: AnimeItem[] = homeObj?.completed || [];

  const newEpLoading = ongoingLoading;
  const popularLoading = ongoingLoading;
  const completedLoading = ongoingLoading;

  // Fallback: if dedicated sections return empty, use slices of ongoing
  const newEpsDisplay = newEps.length > 0 ? newEps : ongoing.slice(0, 12);
  const popularDisplay = popular.length > 0 ? popular : ongoing.slice(0, 12);
  const completedDisplay = completed.length > 0 ? completed : [];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* Hero Banner */}
        {ongoingLoading ? (
          <div className="w-full h-[280px] sm:h-[340px] rounded-2xl bg-gray-800 animate-pulse mb-6" />
        ) : (
          <HeroBanner animeList={ongoing.slice(0, 5)} />
        )}

        {/* ── Terakhir Ditonton ── */}
        {watchHistory.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-purple-400" />
              <span className="text-base font-bold">Terakhir Ditonton</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {watchHistory.slice(0, 10).map((item) => (
                <Link
                  key={item.episodeId}
                  to={`/watch/${item.episodeId}`}
                  className="flex-shrink-0 w-[110px] group"
                  style={{ textDecoration: "none" }}
                >
                  {/* Poster */}
                  <div
                    style={{
                      position: "relative",
                      width: 110,
                      height: 147,
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#1a1a2e",
                      flexShrink: 0,
                    }}
                  >
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Play style={{ width: 28, height: 28, color: "#6b7280" }} />
                      </div>
                    )}
                    {/* Overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)" }} />
                    {/* EP badge */}
                    {item.episodeNum && (
                      <span style={{
                        position: "absolute", bottom: 6, left: 6,
                        fontSize: 10, fontWeight: 600, padding: "2px 6px",
                        background: "#7c3aed", color: "#fff", borderRadius: 5
                      }}>
                        EP {item.episodeNum}
                      </span>
                    )}
                    {/* Play icon on hover */}
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: 0, transition: "opacity 0.2s"
                    }} className="group-hover:!opacity-100">
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <Play style={{ width: 18, height: 18, color: "#fff", fill: "#fff" }} />
                      </div>
                    </div>
                  </div>
                  {/* Title */}
                  <p style={{
                    marginTop: 6, fontSize: 11, color: "#d1d5db",
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    lineHeight: 1.4
                  }}>
                    {item.title || ("Episode " + item.episodeNum)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Anime Ongoing (horizontal scroll) ── */}
        <section className="mb-8">
          <SectionTitle title="Anime Ongoing" to="/anime?filter=ongoing" />
          {ongoingLoading ? (
            <SkeletonCard count={6} />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {ongoing.slice(0, 15).map((anime, i) => (
                <AnimeCard key={anime.animeId} anime={anime} index={i} variant="default" />
              ))}
            </div>
          )}
        </section>

        {/* ── Quick Actions ── */}
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

        {/* ── Update Terbaru (large card grid, gaya foto 2) ── */}
        <section className="mb-8">
          <SectionTitle title="Update Terbaru" to="/anime?filter=ongoing" />
          {newEpLoading || ongoingLoading ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
              {newEpsDisplay.slice(0, 12).map((anime, i) => (
                <AnimeCard key={anime.animeId + "-new-" + i} anime={anime} index={i} variant="large" />
              ))}
            </div>
          )}
        </section>

        {/* ── Hot / Popular (large card grid) ── */}
        <section className="mb-8">
          <SectionTitle title="Anime Populer" to="/anime?filter=all" />
          {popularLoading || ongoingLoading ? (
            <SkeletonGrid count={6} />
          ) : popularDisplay.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
              {popularDisplay.slice(0, 12).map((anime, i) => (
                <AnimeCard key={anime.animeId + "-pop-" + i} anime={anime} index={i} variant="large" />
              ))}
            </div>
          ) : null}
        </section>

        {/* ── Completed Anime (large card grid) ── */}
        {(completedDisplay.length > 0 || completedLoading) && (
          <section className="mb-8">
            <SectionTitle title="Anime Selesai" to="/anime?filter=completed" />
            {completedLoading ? (
              <SkeletonGrid count={6} />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
                {completedDisplay.slice(0, 12).map((anime, i) => (
                  <AnimeCard key={anime.animeId + "-comp-" + i} anime={anime} index={i} variant="large" />
                ))}
              </div>
            )}
          </section>
        )}

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
