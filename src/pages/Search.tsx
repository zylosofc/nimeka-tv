import { useState, useCallback, useRef } from "react";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/LoadingSpinner";
import { Search as SearchIcon, X, Loader2, Compass, Tag, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router";

/* eslint-disable @typescript-eslint/no-explicit-any */

const popularKeywords = [
  "One Piece", "Jujutsu Kaisen", "Demon Slayer", "Naruto",
  "Attack on Titan", "Solo Leveling", "Bleach", "Re:Zero",
  "Haikyuu", "Sword Art Online",
];

// Inline style — tidak di-purge oleh Tailwind production build
const GENRE_COLORS = [
  { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "#fca5a5" },
  { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", text: "#86efac" },
  { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)", text: "#fde047" },
  { bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)", text: "#d8b4fe" },
  { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", text: "#93c5fd" },
  { bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.2)", text: "#f9a8d4" },
  { bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.2)", text: "#67e8f9" },
  { bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", text: "#fdba74" },
  { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", text: "#6ee7b7" },
  { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", text: "#c4b5fd" },
  { bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)", text: "#fda4af" },
  { bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.2)", text: "#5eead4" },
  { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", text: "#a5b4fc" },
  { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", text: "#fcd34d" },
];

function GenreSheet({ onClose }: { onClose: () => void }) {
  const { data, isLoading, refetch } = trpc.anime.genres.useQuery();
  let genres: any[] = [];
  if (Array.isArray(data)) genres = data;
  else if (data && typeof data === "object") {
    const d = data as any;
    genres = d.genreList || d.genres || d.data || [];
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#13131f",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px 20px 0 0",
          maxHeight: "78vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.22s ease-out",
          isolation: "isolate",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.18)", borderRadius: 99 }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Compass style={{ width: 20, height: 20, color: "#a78bfa" }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Daftar Genre</h2>
          </div>
          <button
            onClick={onClose}
            style={{ padding: 6, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <X style={{ width: 16, height: 16, color: "#9ca3af" }} />
          </button>
        </div>

        {/* Scrollable genre list */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px" }}>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} style={{ height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)" }} />
              ))}
            </div>
          ) : genres.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 12 }}>Genre tidak tersedia</p>
              <button
                onClick={() => refetch()}
                style={{ padding: "8px 20px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}
              >
                Muat Ulang
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 32 }}>
              {genres.map((g: any, i: number) => {
                const id = String(g.genreId || g.slug || g.id || i);
                const name = String(g.title || g.name || id);
                const color = GENRE_COLORS[i % GENRE_COLORS.length];
                return (
                  <Link
                    key={`${id}-${i}`}
                    to={`/genre/${id}`}
                    onClick={onClose}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: color.bg,
                      border: `1px solid ${color.border}`,
                      textDecoration: "none",
                      transition: "opacity 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <Tag style={{ width: 14, height: 14, flexShrink: 0, color: color.text }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#e5e7eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </span>
                    </div>
                    <ChevronRight style={{ width: 14, height: 14, flexShrink: 0, color: "#4b5563" }} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [showGenre, setShowGenre] = useState(false);
  const debouncedQuery = useDebounce(query.trim(), 500);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isLoading, isFetching } = trpc.anime.search.useQuery(
    { keyword: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  const searchResults: any[] = (results as any[]) || [];
  const isSearching = isLoading || isFetching;

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* Search Input */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari anime..."
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full h-12 pl-12 pr-12 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all text-base"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isSearching && debouncedQuery.length >= 2 && (
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            )}
            {query && (
              <button type="button" onClick={handleClear} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Genre Button */}
        <button
          onClick={() => setShowGenre(true)}
          className="w-full flex items-center justify-between px-4 py-3 mb-5 bg-[#1a1a2e] border border-white/10 rounded-xl hover:border-purple-500/30 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
              <Compass className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Jelajahi Genre</p>
              <p className="text-xs text-gray-500">Action, Romance, Fantasy, dan lainnya</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        </button>

        {/* Idle state */}
        {!debouncedQuery && (
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3">Pencarian Populer</h2>
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((k) => (
                <button
                  key={k}
                  onClick={() => setQuery(k)}
                  className="px-3 py-1.5 text-sm bg-[#1a1a2e] text-gray-300 rounded-lg border border-white/5 hover:border-purple-500/30 hover:text-purple-300 active:scale-95 transition-all"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {query.length === 1 && (
          <p className="text-center text-sm text-gray-500 py-8">Ketik minimal 2 karakter...</p>
        )}

        {/* Results */}
        {debouncedQuery.length >= 2 && (
          <div>
            {!isSearching && (
              <h2 className="text-sm font-medium text-gray-400 mb-3">
                Hasil &ldquo;{debouncedQuery}&rdquo;
                {searchResults.length > 0 && <span className="ml-1 text-purple-400">({searchResults.length})</span>}
              </h2>
            )}
            {isSearching ? (
              <SkeletonGrid count={8} />
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                {searchResults.map((anime: any, i: number) => (
                  <AnimeCard key={anime.animeId || i} anime={anime} index={i} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <SearchIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Anime tidak ditemukan</p>
                <p className="text-sm text-gray-600 mt-1">Coba kata kunci lain</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showGenre && <GenreSheet onClose={() => setShowGenre(false)} />}
      <BottomNav />
    </div>
  );
}
