import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VideoPlayer from "@/components/VideoPlayer";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Bookmark,
  Heart,
  Tv,
  Users,
  Clock,
  Film,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

type TabType = "info" | "komentar";

export default function Watch() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const episodeScrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = trpc.anime.episode.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const episode = data as any;
  const info = episode?.info as any;

  // Scroll active episode into view in episode list
  useEffect(() => {
    if (episodeScrollRef.current) {
      const active = episodeScrollRef.current.querySelector("[data-active='true']");
      if (active) {
        active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    }
  }, [episode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-white">
        <Header />
        <LoadingSpinner size="lg" text="Memuat episode..." />
        <BottomNav />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-white">
        <Header />
        <div className="text-center py-16">
          <p className="text-gray-500">Episode tidak ditemukan</p>
          <Link to="/" className="text-purple-400 hover:underline mt-2 inline-block">
            Kembali ke Beranda
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const qualities = episode.server?.qualities || [];
  const downloadQualities = episode.downloadUrl?.qualities || [];
  const episodeList: any[] = info?.episodeList || [];

  // Current episode number from title or slug
  const currentEpsNum = episode.title?.match(/(\d+)/)?.[1] ?? null;

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-24">
      <Header />

      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-3">
        {/* Back + Episode Title */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-3"
        >
          <Link
            to={info ? `/anime/${episode.animeId}` : "/"}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
          <h1 className="text-sm font-semibold text-white line-clamp-1 flex-1">
            {episode.title}
          </h1>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <VideoPlayer
            defaultUrl={episode.defaultStreamingUrl}
            qualities={qualities}
            downloadQualities={downloadQualities}
          />
        </motion.div>

        {/* Prev / Next nav */}
        <div className="flex items-center justify-between mt-3 gap-2">
          {episode.hasPrevEpisode && episode.prevEpisode ? (
            <Link
              to={`/watch/${episode.prevEpisode.episodeId}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a2e] text-gray-300 rounded-xl hover:bg-[#252540] transition-colors text-xs flex-1 justify-center"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Sebelumnya
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          <Link
            to={info ? `/anime/${episode.animeId}` : "/"}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 text-purple-300 rounded-xl hover:bg-purple-600/30 transition-colors text-xs"
          >
            <Tv className="w-3.5 h-3.5" />
            Semua Eps
          </Link>

          {episode.hasNextEpisode && episode.nextEpisode ? (
            <Link
              to={`/watch/${episode.nextEpisode.episodeId}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-xs flex-1 justify-center"
            >
              Selanjutnya
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Anime Info Card */}
        {info && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 flex gap-3 items-start"
          >
            {/* Poster */}
            <Link to={`/anime/${episode.animeId}`} className="flex-shrink-0">
              <div className="w-16 h-20 sm:w-20 sm:h-[104px] rounded-xl overflow-hidden bg-gray-800 border border-white/10 shadow-lg">
                <img
                  src={info.poster}
                  alt={info.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link to={`/anime/${episode.animeId}`}>
                <h2 className="text-sm font-bold text-white line-clamp-2 hover:text-purple-300 transition-colors leading-snug">
                  {info.title}
                </h2>
              </Link>

              {/* Score + Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {info.score && (
                  <span className="flex items-center gap-0.5 text-[11px] px-2 py-0.5 bg-yellow-500/15 text-yellow-400 rounded-md border border-yellow-500/20 font-medium">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {info.score}
                  </span>
                )}
                {info.type && (
                  <span className="text-[11px] px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded-md border border-purple-500/20">
                    {info.type}
                  </span>
                )}
                {info.status && (
                  <span className="text-[11px] px-2 py-0.5 bg-green-500/15 text-green-400 rounded-md border border-green-500/20">
                    {info.status}
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 mt-2">
                {info.episodes > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Film className="w-3 h-3" />
                    {info.episodes} Eps
                  </span>
                )}
                {info.duration && (
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    {info.duration}
                  </span>
                )}
                {info.members && (
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Users className="w-3 h-3" />
                    {info.members}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-2.5">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] transition-colors border border-white/10">
                  <Bookmark className="w-3.5 h-3.5" />
                  Simpan
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-pink-500/20 text-gray-300 hover:text-pink-300 text-[11px] transition-colors border border-white/10 hover:border-pink-500/30">
                  <Heart className="w-3.5 h-3.5" />
                  Suka
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Episode List — number buttons */}
        {episodeList.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-white">Episode List</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{episodeList.length} eps</span>
                <button
                  onClick={() => {
                    if (episodeScrollRef.current) {
                      episodeScrollRef.current.scrollLeft -= 160;
                    }
                  }}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (episodeScrollRef.current) {
                      episodeScrollRef.current.scrollLeft += 160;
                    }
                  }}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={episodeScrollRef}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
            >
              {[...episodeList].reverse().map((ep: any) => {
                const isActive = ep.episodeId === slug;
                return (
                  <Link
                    key={ep.episodeId}
                    to={`/watch/${ep.episodeId}`}
                    data-active={isActive}
                  >
                    <div
                      className={`
                        w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center
                        text-sm font-semibold transition-all duration-200
                        ${isActive
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                          : "bg-[#1a1a2e] text-gray-300 hover:bg-[#252540] hover:text-white border border-white/5"
                        }
                      `}
                    >
                      {ep.eps}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Tabs: Info / Komentar */}
        {info && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-5"
          >
            {/* Tab Header */}
            <div className="flex border-b border-white/10">
              {(["info", "komentar"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    relative px-5 py-2.5 text-sm font-medium capitalize transition-colors
                    ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"}
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="pt-4">
              {activeTab === "info" && (
                <div className="space-y-4">
                  {/* Genres */}
                  {info.genreList?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {info.genreList.map((g: any) => (
                        <Link
                          key={g.genreId}
                          to={`/genre/${g.genreId}`}
                          className="text-xs px-3 py-1 bg-purple-600/10 text-purple-300 rounded-full border border-purple-500/20 hover:bg-purple-600/20 transition-colors"
                        >
                          {g.title}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Synopsis */}
                  {info.synopsis?.paragraphs?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Sinopsis
                      </h3>
                      <div className="text-sm text-gray-400 leading-relaxed space-y-2">
                        {info.synopsis.paragraphs.slice(0, 2).map((p: string, i: number) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Release time */}
                  {episode.releaseTime && (
                    <p className="text-xs text-gray-500">
                      Rilis: {episode.releaseTime}
                    </p>
                  )}
                </div>
              )}

              {activeTab === "komentar" && (
                <div className="py-8 text-center">
                  <p className="text-gray-500 text-sm">Komentar belum tersedia</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
