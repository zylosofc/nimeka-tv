import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VideoPlayer from "@/components/VideoPlayer";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Star, Bookmark, Heart, Tv, Users, Clock, Film,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

type TabType = "info" | "komentar";

const HISTORY_KEY = "nimeka_watch_history";
const PROGRESS_KEY = "nimeka_progress";

function getProgress(episodeId: string): number {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[episodeId] || 0;
  } catch { return 0; }
}

function saveProgress(episodeId: string, time: number) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[episodeId] = time;
    // Keep max 100 entries
    const keys = Object.keys(data);
    if (keys.length > 100) delete data[keys[0]];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export default function Watch() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const episodeScrollRef = useRef<HTMLDivElement>(null);

  // Resume time dari localStorage
  const resumeTime = slug ? getProgress(slug) : 0;

  const { data, isLoading } = trpc.anime.episode.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const episode = data as any;
  const info = episode?.info as any;

  // Save watch history + progress ke localStorage
  useEffect(() => {
    if (!episode || !slug) return;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const history = raw ? JSON.parse(raw) : [];
      const item = {
        animeId: episode.animeId || slug,
        title: info?.title || episode.title || "",
        poster: info?.poster || episode.poster || "",
        episodeTitle: episode.title || "",
        episodeId: slug,
        episodeNum: episode.eps || "",
        watchedAt: Date.now(),
      };
      const filtered = history.filter((h: any) => h.episodeId !== slug);
      localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...filtered].slice(0, 30)));
    } catch { /* ignore */ }
  }, [episode, slug, info]);

  // Scroll ke episode aktif
  useEffect(() => {
    if (episodeScrollRef.current) {
      const active = episodeScrollRef.current.querySelector("[data-active='true']");
      if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [slug, episode]);

  // Throttled time saver (tiap 5 detik)
  const lastSavedTime = useRef(0);
  const handleTimeUpdate = useCallback((time: number) => {
    if (!slug) return;
    if (time - lastSavedTime.current >= 5) {
      lastSavedTime.current = time;
      saveProgress(slug, time);
    }
  }, [slug]);

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
          <Link to="/" className="text-purple-400 hover:underline mt-2 inline-block">Kembali ke Beranda</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const qualities = episode.server?.qualities || [];
  const episodeList: any[] = info?.episodeList || [];
  const reversedList = [...episodeList].reverse();

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-24">
      <Header />

      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-3">
        {/* Back + Title */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-3"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </button>
          <h1 className="text-sm font-semibold text-white line-clamp-1 flex-1">
            {episode.title}
          </h1>
        </motion.div>

        {/* Video Player — dengan resume time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <VideoPlayer
            defaultUrl={episode.defaultStreamingUrl}
            qualities={qualities}
            resumeTime={resumeTime}
            onTimeUpdate={handleTimeUpdate}
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
          ) : <div className="flex-1" />}

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
          ) : <div className="flex-1" />}
        </div>

        {/* Anime Info Card */}
        {info && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-4 flex gap-3 items-start"
          >
            <Link to={`/anime/${episode.animeId}`} className="flex-shrink-0">
              <div className="w-16 h-20 sm:w-20 sm:h-[104px] rounded-xl overflow-hidden bg-gray-800 border border-white/10 shadow-lg">
                {info.poster ? (
                  <img src={info.poster} alt={info.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link to={`/anime/${episode.animeId}`}>
                <h2 className="text-sm font-bold text-white line-clamp-2 hover:text-purple-300 transition-colors leading-snug">
                  {info.title}
                </h2>
              </Link>

              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {info.score && (
                  <span className="flex items-center gap-0.5 text-[11px] px-2 py-0.5 bg-yellow-500/15 text-yellow-400 rounded-md border border-yellow-500/20 font-medium">
                    <Star className="w-3 h-3 fill-yellow-400" />{info.score}
                  </span>
                )}
                {info.type && (
                  <span className="text-[11px] px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded-md border border-purple-500/20">{info.type}</span>
                )}
                {info.status && (
                  <span className="text-[11px] px-2 py-0.5 bg-green-500/15 text-green-400 rounded-md border border-green-500/20">{info.status}</span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2">
                {info.episodes > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Film className="w-3 h-3" />{info.episodes} Eps
                  </span>
                )}
                {info.duration && (
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />{info.duration}
                  </span>
                )}
                {info.members && (
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Users className="w-3 h-3" />{info.members}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={() => setBookmarked(b => !b)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] transition-all border ${
                    bookmarked
                      ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-purple-400" : ""}`} />
                  {bookmarked ? "Tersimpan" : "Simpan"}
                </button>
                <button
                  onClick={() => setLiked(l => !l)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] transition-all border ${
                    liked
                      ? "bg-pink-600/20 text-pink-300 border-pink-500/30"
                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-pink-500/10 hover:text-pink-300 hover:border-pink-500/20"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? "fill-pink-400" : ""}`} />
                  {liked ? "Disukai" : "Suka"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Episode List */}
        {episodeList.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-white">EPISODE LIST</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{episodeList.length} eps</span>
                <button
                  onClick={() => { if (episodeScrollRef.current) episodeScrollRef.current.scrollLeft -= 160; }}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (episodeScrollRef.current) episodeScrollRef.current.scrollLeft += 160; }}
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
              {reversedList.map((ep: any) => {
                const isActive = ep.episodeId === slug;
                return (
                  <Link
                    key={ep.episodeId}
                    to={`/watch/${ep.episodeId}`}
                    data-active={isActive}
                    replace
                  >
                    <div className={`
                      w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center
                      text-sm font-semibold transition-all duration-200
                      ${isActive
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                        : "bg-[#1a1a2e] text-gray-300 hover:bg-[#252540] hover:text-white border border-white/5"
                      }
                    `}>
                      {ep.eps}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Genre Tags */}
        {info?.genreList?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
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

        {/* Sinopsis */}
        {info?.synopsis?.paragraphs?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sinopsis</h3>
            <div className="text-sm text-gray-400 leading-relaxed space-y-2">
              {info.synopsis.paragraphs.slice(0, 2).map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
