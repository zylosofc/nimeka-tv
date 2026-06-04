import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VideoPlayer from "@/components/VideoPlayer";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Tv, Calendar,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
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
  const info = episode?.info as any;

  useEffect(() => {
    if (!slug) return;
    const saved = getWatchProgress(slug);
    setStartAtSeconds(saved);
    setProgressLoaded(true);
  }, [slug]);

  useEffect(() => {
    if (episodeScrollRef.current) {
      const active = episodeScrollRef.current.querySelector("[data-active='true']");
      if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [slug, episode]);

  const handleProgress = useCallback((seconds: number) => {
    if (!slug || !episode) return;
    saveWatchProgress({
      episodeId: slug,
      animeId: episode.animeId || "",
      animeTitle: info?.title || episode.title || "",
      episodeNumber: episode.eps || "",
      poster: info?.poster || "",
      progressSeconds: seconds,
    });
  }, [slug, episode, info]);

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
          <Link to="/" className="text-purple-400 hover:underline mt-2 inline-block">Kembali</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const qualities = episode.server?.qualities || [];
  const episodeList: any[] = info?.episodeList || [];

  // Ambil resolusi dari quality pertama
  const resolution = qualities[0]?.title || "";
  const releaseDate = episode.releaseTime || episode.date || "";

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-24">
      <Header />

      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-3">

        {/* Back bar */}
        <div className="flex items-center gap-2 mb-3">
          <Link
            to={info ? `/anime/${episode.animeId}` : "/"}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
          <h1 className="text-sm font-semibold text-white line-clamp-1 flex-1">
            {episode.title}
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

        {/* Prev / Next nav */}
        <div className="flex items-center justify-between mt-3 gap-2">
          {episode.hasPrevEpisode && episode.prevEpisode ? (
            <button
              onClick={() => navigate(`/watch/${episode.prevEpisode.episodeId}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a2e] text-gray-300 rounded-xl hover:bg-[#252540] transition-colors text-xs flex-1 justify-center"
            >
              <ArrowLeft className="w-3.5 h-3.5" />Sebelumnya
            </button>
          ) : <div className="flex-1" />}

          <Link
            to={info ? `/anime/${episode.animeId}` : "/"}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 text-purple-300 rounded-xl hover:bg-purple-600/30 transition-colors text-xs"
          >
            <Tv className="w-3.5 h-3.5" />Semua Eps
          </Link>

          {episode.hasNextEpisode && episode.nextEpisode ? (
            <button
              onClick={() => navigate(`/watch/${episode.nextEpisode.episodeId}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-xs flex-1 justify-center"
            >
              Selanjutnya<ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : <div className="flex-1" />}
        </div>

        {/* ── INFO CARD (mirip foto 4) ── */}
        {info && (
          <div className="mt-4 flex gap-3 items-start">
            {/* Poster */}
            <Link to={`/anime/${episode.animeId}`} className="flex-shrink-0">
              <div className="w-20 h-[104px] rounded-xl overflow-hidden bg-gray-800 border border-white/10 shadow-lg">
                {info.poster ? (
                  <img src={info.poster} alt={info.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>
            </Link>

            {/* Title + meta */}
            <div className="flex-1 min-w-0 pt-1">
              <Link to={`/anime/${episode.animeId}`}>
                <h2 className="text-base font-bold text-white line-clamp-2 hover:text-purple-300 transition-colors leading-snug">
                  {info.title}
                </h2>
              </Link>

              {/* Kolom kecil: Episode · Resolusi · Tanggal */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {episode.eps && (
                  <span className="text-[11px] px-2.5 py-1 bg-[#1a1a2e] text-gray-300 rounded-lg border border-white/10 font-medium">
                    Episode {episode.eps}
                  </span>
                )}
                {resolution && (
                  <span className="text-[11px] px-2.5 py-1 bg-[#1a1a2e] text-gray-300 rounded-lg border border-white/10 font-medium">
                    {resolution}
                  </span>
                )}
                {releaseDate && (
                  <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-[#1a1a2e] text-gray-300 rounded-lg border border-white/10">
                    <Calendar className="w-3 h-3" />{releaseDate}
                  </span>
                )}
              </div>

              {/* Sinopsis singkat */}
              {info.synopsis?.paragraphs?.[0] && (
                <p className="mt-2 text-[11px] text-gray-500 line-clamp-3 leading-relaxed">
                  {info.synopsis.paragraphs[0]}
                </p>
              )}
            </div>
          </div>
        )}

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
                  <button
                    key={ep.episodeId}
                    data-active={isActive}
                    onClick={() => navigate(`/watch/${ep.episodeId}`)}
                    className={`w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200
                      ${isActive
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                        : "bg-[#1a1a2e] text-gray-300 hover:bg-[#252540] hover:text-white border border-white/5"
                      }`}
                  >
                    {ep.eps}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Genre tags */}
        {info?.genreList?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {info.genreList.map((g: any) => (
              <Link key={g.genreId} to={`/genre/${g.genreId}`}
                className="text-xs px-3 py-1 bg-purple-600/10 text-purple-300 rounded-full border border-purple-500/20 hover:bg-purple-600/20 transition-colors">
                {g.title}
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
