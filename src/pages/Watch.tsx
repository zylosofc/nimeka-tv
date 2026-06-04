import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VideoPlayer from "@/components/VideoPlayer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Tv, Calendar, Star, Clock, Film } from "lucide-react";
import { useRef, useEffect, useCallback, useState } from "react";
import { saveWatchProgress, getWatchProgress } from "@/hooks/useWatchHistory";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Watch() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const episodeScrollRef = useRef<HTMLDivElement>(null);
  const [startAtSeconds, setStartAtSeconds] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(false);

  const { data, isLoading } = trpc.anime.episode.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const episode = data as any;

  // Coba semua kemungkinan field name untuk info
  const info = episode?.info
    || episode?.animeInfo
    || episode?.anime
    || episode?.detail
    || null;

  // Normalize field
  const posterFromEpisode = info?.poster || info?.thumbnail || info?.image || info?.cover || "";
  const animeId = episode?.animeId || info?.animeId || "";
  const title = info?.title || info?.name || episode?.title || "";
  const synopsis = info?.synopsis?.paragraphs?.[0] || info?.description || "";
  const genreList = info?.genreList || info?.genres || [];
  const resolution = episode?.defaultQuality || episode?.server?.qualities?.[0]?.title || "";
  const releaseDate = episode?.releaseTime || episode?.date || episode?.aired || "";

  // Fetch anime detail sebagai fallback poster — hanya kalau poster dari episode kosong
  const { data: detailData } = trpc.anime.detail.useQuery(
    { slug: animeId },
    { enabled: !!animeId && !posterFromEpisode }
  );
  const detailInfo = detailData as any;
  const posterFallback = detailInfo?.poster || detailInfo?.thumbnail || detailInfo?.image || detailInfo?.cover || "";
  const poster = posterFromEpisode || posterFallback;

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
      episodeNumber: episode.eps || "",
      poster,
      progressSeconds: seconds,
    });
  }, [slug, episode, title, poster, animeId]);

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

  const qualities = episode.server?.qualities || [];
  const episodeList: any[] = info?.episodeList || episode?.episodeList || [];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-24">
      <Header />
      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-3">

        {/* Back bar */}
        <div className="flex items-center gap-2 mb-3">
          <Link
            to={animeId ? `/anime/${animeId}` : "/"}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
          >
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
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a2e] text-gray-300 rounded-xl hover:bg-[#252540] text-xs flex-1 justify-center">
              <ArrowLeft className="w-3.5 h-3.5" />Sebelumnya
            </button>
          ) : <div className="flex-1" />}

          <Link to={animeId ? `/anime/${animeId}` : "/"}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 text-purple-300 rounded-xl hover:bg-purple-600/30 text-xs">
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

          {/* Banner poster — ambil dari anime info */}
          <Link to={animeId ? `/anime/${animeId}` : "/"} className="block relative w-full" style={{ height: 160 }}>
            {poster ? (
              <>
                {/* Background blur */}
                <img
                  src={poster}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-110"
                  style={{ filter: "blur(18px) brightness(0.4)" }}
                  aria-hidden
                  loading="lazy"
                />
                {/* Poster center */}
                <img
                  src={poster}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-contain"
                  loading="lazy"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-[#0f0f1a]">
                <Tv className="w-12 h-12 text-gray-700" />
              </div>
            )}
            {/* gradient bawah */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
          </Link>

          {/* Meta bawah banner */}
          <div className="px-3 pb-3 -mt-1">
            {title && (
              <Link to={animeId ? `/anime/${animeId}` : "/"}>
                <h2 className="text-[15px] font-bold text-white line-clamp-2 hover:text-purple-300 transition-colors leading-snug">
                  {title}
                </h2>
              </Link>
            )}

            {/* Pill row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {episode.eps && (
                <span className="text-[11px] px-2.5 py-1 bg-[#0f0f1a] text-gray-300 rounded-lg border border-white/10 font-medium">
                  Episode {episode.eps}
                </span>
              )}
              {resolution && (
                <span className="text-[11px] px-2.5 py-1 bg-[#0f0f1a] text-gray-300 rounded-lg border border-white/10 font-medium">
                  {resolution}
                </span>
              )}
              {releaseDate && (
                <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-[#0f0f1a] text-gray-300 rounded-lg border border-white/10">
                  <Calendar className="w-3 h-3" />{releaseDate}
                </span>
              )}
            </div>

            {/* Extra info */}
            <div className="flex items-center gap-3 mt-1.5">
              {info?.score && (
                <span className="flex items-center gap-0.5 text-[11px] text-yellow-400">
                  <Star className="w-3 h-3 fill-yellow-400" />{info.score}
                </span>
              )}
              {info?.duration && (
                <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                  <Clock className="w-3 h-3" />{info.duration}
                </span>
              )}
              {info?.episodes > 0 && (
                <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                  <Film className="w-3 h-3" />{info.episodes} eps
                </span>
              )}
            </div>

            {/* Sinopsis */}
            {synopsis && (
              <p className="mt-1.5 text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                {synopsis}
              </p>
            )}
          </div>
        </div>

        {/* ── EPISODE LIST ── */}
        {episodeList.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-white">Episode List</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{episodeList.length} eps</span>
                <button onClick={() => { if (episodeScrollRef.current) episodeScrollRef.current.scrollLeft -= 160; }} className="p-0.5 rounded hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => { if (episodeScrollRef.current) episodeScrollRef.current.scrollLeft += 160; }} className="p-0.5 rounded hover:bg-white/10">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div ref={episodeScrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {[...episodeList].reverse().map((ep: any) => {
                const isActive = ep.episodeId === slug;
                return (
                  <button key={ep.episodeId} data-active={isActive}
                    onClick={() => navigate(`/watch/${ep.episodeId}`)}
                    className={`w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                        : "bg-[#1a1a2e] text-gray-300 hover:bg-[#252540] border border-white/5"
                    }`}>
                    {ep.eps}
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
      </main>
      <BottomNav />
    </div>
  );
}
