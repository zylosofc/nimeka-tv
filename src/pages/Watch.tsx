import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VideoPlayer from "@/components/VideoPlayer";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Star, Bookmark, Heart, Trophy, Users, Clock, Film
} from "lucide-react";
import { useRef, useEffect, useCallback, useState } from "react";
import { saveWatchProgress, getWatchProgress } from "@/hooks/useWatchHistory";

/* eslint-disable @typescript-eslint/no-explicit-any */

function formatRelease(raw: string): string {
  if (!raw) return "";
  // Coba parse tanggal — kalau gagal kembalikan apa adanya
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
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

  // Fetch detail sebagai fallback poster
  const { data: detailData } = trpc.anime.detail.useQuery(
    { slug: animeId },
    { enabled: !!animeId && !posterFromEpisode }
  );
  const det = detailData as any;
  const posterFallback = det?.poster || det?.thumbnail || det?.image || det?.cover || "";
  const poster = posterFromEpisode || posterFallback;

  // Stats dari API
  const score   = info?.score ?? det?.score ?? null;
  const views   = info?.members ?? info?.views ?? info?.totalViews ?? det?.members ?? det?.views ?? null;
  const rank    = info?.rank ?? det?.rank ?? null;
  const member  = info?.member ?? det?.member ?? null;
  const duration = info?.duration ?? det?.duration ?? null;
  const totalEps = info?.episodes ?? det?.episodes ?? null;
  const qualities = episode?.server?.qualities || [];

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

        {/* ── INFO CARD ── */}
        <div className="mt-4 rounded-2xl overflow-hidden bg-[#1a1a2e] border border-white/5">
          <div className="px-3 pt-3 pb-2 flex gap-3 items-start">
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

            {/* Meta kanan poster */}
            <div className="flex-1 min-w-0">
              <Link to={animeId ? `/anime/${animeId}` : "/"}>
                <h2 className="text-[14px] font-bold text-white line-clamp-2 leading-snug hover:text-purple-300 transition-colors">
                  {title}
                </h2>
              </Link>

              {/* Badge row: Episode (purple) · Rating (gold) · Views (gray) */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {episode.eps && (
                  <span className="text-[11px] px-2.5 py-0.5 bg-purple-600 text-white rounded-full font-semibold">
                    Episode {episode.eps}
                  </span>
                )}
                {score && (
                  <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-yellow-500 text-black rounded-full font-bold">
                    <Star className="w-3 h-3 fill-black" />{score}
                  </span>
                )}
                {views && (
                  <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-white/10 text-gray-300 rounded-full">
                    👁 {Number(views) >= 1000
                      ? `${(Number(views) / 1000).toFixed(1)}K`
                      : Number(views).toLocaleString("id-ID")} ditonton
                  </span>
                )}
              </div>

              {/* Simpan & Suka */}
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={() => setSaved(s => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${saved
                    ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"}`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-purple-400" : ""}`} />
                  Simpan
                </button>
                <button
                  onClick={() => setLiked(l => !l)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${liked
                    ? "bg-pink-600/20 text-pink-300 border-pink-500/30"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? "fill-pink-400" : ""}`} />
                  Suka
                </button>
              </div>
            </div>
          </div>

          {/* ── STATS GRID (4 kolom) ── */}
          {(totalEps || rank || member || duration) && (
            <div className="mx-3 mb-3 grid grid-cols-4 divide-x divide-white/5 bg-[#0f0f1a] rounded-xl border border-white/5 overflow-hidden">
              {[
                { icon: <Film className="w-4 h-4" />, label: "Episode", value: totalEps ?? "-" },
                { icon: <Trophy className="w-4 h-4" />, label: "Rank", value: rank ? `#${rank}` : "-" },
                { icon: <Users className="w-4 h-4" />, label: "Member",
                  value: member
                    ? Number(member) >= 1000 ? `${(Number(member)/1000).toFixed(1)}K` : member
                    : "-" },
                { icon: <Clock className="w-4 h-4" />, label: "Durasi", value: duration ?? "-" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center justify-center py-3 gap-1">
                  <span className="text-purple-400">{s.icon}</span>
                  <span className="text-xs text-gray-400">{s.label}</span>
                  <span className="text-sm font-bold text-white">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Sinopsis */}
          {synopsis && (
            <p className="px-3 pb-3 text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
              {synopsis}
            </p>
          )}
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
                    className={`flex-shrink-0 w-[60px] flex flex-col items-center justify-center rounded-xl py-2 px-1 transition-all duration-200 border ${
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
      </main>
      <BottomNav />
    </div>
  );
}
