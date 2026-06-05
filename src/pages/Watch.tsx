import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VideoPlayer from "@/components/VideoPlayer";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Star, Bookmark, Heart, Tv, Clock, Film
} from "lucide-react";
import { useRef, useEffect, useCallback, useState } from "react";
import { saveWatchProgress, getWatchProgress } from "@/hooks/useWatchHistory";

/* eslint-disable @typescript-eslint/no-explicit-any */

function formatRelease(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Hari ini";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}mgg lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch { return raw; }
}

export default function Watch() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const episodeScrollRef = useRef<HTMLDivElement>(null);
  const [startAtSeconds, setStartAtSeconds] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);

  const { data, isLoading } = trpc.anime.episode.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const episode = data as any;
  const info = episode?.info || episode?.animeInfo || episode?.anime || episode?.detail || null;

  const posterFromEpisode = info?.poster || info?.thumbnail || info?.image || info?.cover || "";
  const animeId = episode?.animeId || info?.animeId || "";
  const title = info?.title || info?.name || episode?.title || "";
  const synopsis = info?.synopsis?.paragraphs?.[0] || info?.description || "";
  const genreList: any[] = info?.genreList || info?.genres || [];
  const episodeList: any[] = info?.episodeList || episode?.episodeList || [];
  const qualities = episode?.server?.qualities || [];

  // Fetch anime detail — untuk poster fallback
  const { data: detailData } = trpc.anime.detail.useQuery(
    { slug: animeId },
    { enabled: !!animeId }
  );
  const det = detailData as any;
  const poster = posterFromEpisode || det?.poster || det?.thumbnail || det?.image || det?.cover || "";
  const duration = info?.duration ?? det?.duration ?? null;
  const score = info?.score ?? det?.score ?? null;

  // Eps aktif dari episodeList
  const currentEpFromList = episodeList.find((e: any) => e.episodeId === slug);
  const currentEps = episode?.eps || currentEpFromList?.eps || currentEpFromList?.episodeNumber || null;
  const resolution = episode?.defaultQuality || qualities?.[0]?.title || null;

  useEffect(() => {
    if (!slug) return;
    setStartAtSeconds(getWatchProgress(slug));
    setProgressLoaded(true);
  }, [slug]);

  useEffect(() => {
    const el = episodeScrollRef.current?.querySelector("[data-active='true']");
    if (el) el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [slug, episode]);

  const handleProgress = useCallback((seconds: number) => {
    if (!slug || !episode) return;
    saveWatchProgress({
      episodeId: slug,
      animeId,
      animeTitle: title,
      episodeNumber: currentEps || "",
      poster,
      progressSeconds: seconds,
    });
  }, [slug, episode, title, poster, animeId, currentEps]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-white">
        <Header /><LoadingSpinner size="lg" text="Memuat episode..." /><BottomNav />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-white">
        <Header />
        <div className="text-center py-16">
          <p className="text-gray-500">Episode tidak ditemukan</p>
          <Link to="/" className="text-purple-400 hover:underline mt-2 inline-block">Kembali</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-24">
      <Header />
      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-3">

        {/* Back bar */}
        <div className="flex items-center gap-2 mb-3">
          <Link to={animeId ? `/anime/${animeId}` : "/"}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
          <h1 className="text-sm font-semibold text-white line-clamp-1 flex-1">
            {episode.title || title}
          </h1>
        </div>

        {/* Video Player */}
        {progressLoaded && (
          <VideoPlayer
            defaultUrl={episode.defaultStreamingUrl}
            qualities={qualities}
            startAtSeconds={startAtSeconds}
            onProgress={handleProgress}
          />
        )}

        {/* Prev / Next */}
        <div className="flex items-center justify-between mt-3 gap-2">
          {episode.hasPrevEpisode && episode.prevEpisode ? (
            <button onClick={() => navigate(`/watch/${episode.prevEpisode.episodeId}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a2e] text-gray-300 rounded-xl hover:bg-[#252540] text-xs flex-1 justify-center border border-white/5">
              <ArrowLeft className="w-3.5 h-3.5" />Sebelumnya
            </button>
          ) : <div className="flex-1" />}

          <Link to={animeId ? `/anime/${animeId}` : "/"}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 text-purple-300 rounded-xl hover:bg-purple-600/30 text-xs border border-purple-500/20">
            <Tv className="w-3.5 h-3.5" />Semua Eps
          </Link>

          {episode.hasNextEpisode && episode.nextEpisode ? (
            <button onClick={() => navigate(`/watch/${episode.nextEpisode.episodeId}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-xs flex-1 justify-center">
              Selanjutnya<ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : <div className="flex-1" />}
        </div>

        {/* ── INFO CARD ── */}
        <div className="mt-4 rounded-2xl overflow-hidden bg-[#1a1a2e] border border-white/5">
          <div className="px-3 pt-3 pb-3 flex gap-3 items-start">

            {/* Poster kecil */}
            <Link to={animeId ? `/anime/${animeId}` : "/"} className="flex-shrink-0">
              <div className="w-[60px] h-[80px] rounded-xl overflow-hidden bg-gray-800 border border-white/10 shadow-lg">
                {poster ? (
                  <img src={poster} alt={title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            </Link>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              <Link to={animeId ? `/anime/${animeId}` : "/"}>
                <h2 className="text-[14px] font-bold text-white line-clamp-2 leading-snug hover:text-purple-300 transition-colors">
                  {title}
                </h2>
              </Link>

              {/* Pills: Ep · Resolusi · Durasi · Simpan · Suka */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {currentEps && (
                  <span className="text-[11px] px-2.5 py-1 bg-[#0f0f1a] text-gray-300 rounded-lg border border-white/10 font-medium">
                    Ep {currentEps}
                  </span>
                )}
                {resolution && (
                  <span className="text-[11px] px-2.5 py-1 bg-[#0f0f1a] text-gray-300 rounded-lg border border-white/10 font-medium">
                    {resolution}
                  </span>
                )}
                {duration && (
                  <span className="text-[11px] px-2.5 py-1 bg-[#0f0f1a] text-gray-300 rounded-lg border border-white/10 font-medium">
                    {duration}
                  </span>
                )}
                <button onClick={() => setSaved(s => !s)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border transition-all ${saved
                    ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"}`}>
                  <Bookmark className={`w-3 h-3 ${saved ? "fill-purple-400" : ""}`} />Simpan
                </button>
                <button onClick={() => setLiked(l => !l)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border transition-all ${liked
                    ? "bg-pink-600/20 text-pink-300 border-pink-500/30"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"}`}>
                  <Heart className={`w-3 h-3 ${liked ? "fill-pink-400" : ""}`} />Suka
                </button>
              </div>

              {/* Score */}
              {score && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-medium">{score}</span>
                </div>
              )}

              {/* Sinopsis */}
              {synopsis && (
                <p className="mt-1.5 text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{synopsis}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── EPISODE LIST ── */}
        {episodeList.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-bold text-white uppercase tracking-wide">Episode List</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{episodeList.length} eps</span>
                <button onClick={() => { if (episodeScrollRef.current) episodeScrollRef.current.scrollLeft -= 160; }}
                  className="p-0.5 rounded hover:bg-white/10"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => { if (episodeScrollRef.current) episodeScrollRef.current.scrollLeft += 160; }}
                  className="p-0.5 rounded hover:bg-white/10"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div ref={episodeScrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {[...episodeList].reverse().map((ep: any) => {
                const isActive = ep.episodeId === slug;
                const relDate = formatRelease(ep.releaseDate || ep.date || ep.aired || "");
                return (
                  <button key={ep.episodeId} data-active={isActive}
                    onClick={() => navigate(`/watch/${ep.episodeId}`)}
                    className={`flex-shrink-0 w-[60px] flex flex-col items-center justify-center rounded-xl py-2 px-1 transition-all border ${
                      isActive
                        ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30"
                        : "bg-[#1a1a2e] text-gray-300 border-white/5 hover:bg-[#252540]"
                    }`}>
                    <span className="text-sm font-bold leading-none">{ep.eps}</span>
                    {relDate && (
                      <span className={`text-[9px] mt-1 leading-tight text-center ${isActive ? "text-purple-200" : "text-gray-500"}`}>
                        {relDate}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Genre tags */}
        {genreList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {genreList.map((g: any) => (
              <Link key={g.genreId || g.slug} to={`/genre/${g.genreId || g.slug}`}
                className="text-xs px-3 py-1 bg-purple-600/10 text-purple-300 rounded-full border border-purple-500/20 hover:bg-purple-600/20 transition-colors">
                {g.title || g.name}
              </Link>
            ))}
          </div>
        )}

        {/* Extra info row */}
        {(info?.episodes || info?.duration || info?.type) && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            {info.episodes > 0 && (
              <span className="flex items-center gap-1"><Film className="w-3 h-3" />{info.episodes} eps</span>
            )}
            {info.duration && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{info.duration}</span>
            )}
            {info.type && <span>{info.type}</span>}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
