import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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

const ICON_COLORS = [
  "#f87171","#4ade80","#facc15","#c084fc","#60a5fa",
  "#f472b6","#22d3ee","#818cf8","#fb923c","#34d399",
  "#a78bfa","#2dd4bf","#fbbf24","#fb7185","#e879f9",
];

// Genre popup — pakai createPortal + 100% inline style, ZERO Tailwind dynamic class
function GenrePopup({ onClose }: { onClose: () => void }) {
  const { data, isLoading, refetch } = trpc.anime.genres.useQuery();
  const sheetRef = useRef<HTMLDivElement>(null);

  let genres: any[] = [];
  if (Array.isArray(data)) genres = data;
  else if (data && typeof data === "object") {
    const d = data as any;
    genres = d.genreList || d.genres || d.list || d.data || [];
  }

  // Lock body scroll saat popup terbuka
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const popup = (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}
    >
      <div
        ref={sheetRef}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: "#12121e",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px 20px 0 0",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          // Animasi pakai CSS transform — tidak pakai framer-motion
          animation: "sheetUp 0.2s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 99 }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px 12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Compass style={{ width: 18, height: 18, color: "#a78bfa" }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Daftar Genre</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(255,255,255,0.06)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}
          >
            <X style={{ width: 15, height: 15, color: "#9ca3af" }} />
          </button>
        </div>

        {/* Scroll area */}
        <div style={{ overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" as any, padding: "8px 12px 32px" }}>
          {isLoading ? (
            // Skeleton
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} style={{
                  height: 44, borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  animation: "pulse 1.4s ease-in-out infinite",
                }} />
              ))}
            </div>
          ) : genres.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 12 }}>Genre tidak tersedia</p>
              <button
                onClick={() => refetch()}
                style={{
                  padding: "8px 20px", background: "#7c3aed", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer"
                }}
              >
                Muat Ulang
              </button>
            </div>
          ) : (
            // Genre list — dua kolom, 100% inline style
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              paddingTop: 8,
            }}>
              {genres.map((g: any, i: number) => {
                const id = String(g.genreId || g.slug || g.id || i);
                const name = String(g.title || g.name || id);
                const iconColor = ICON_COLORS[i % ICON_COLORS.length];
                return (
                  <Link
                    key={`${id}-${i}`}
                    to={`/genre/${id}`}
                    onClick={onClose}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 12px", borderRadius: 10, textDecoration: "none",
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <Tag style={{ width: 13, height: 13, flexShrink: 0, color: iconColor }} />
                    <span style={{
                      fontSize: 13, fontWeight: 500, color: "#d1d5db",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {name}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );

  return createPortal(popup, document.body);
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

        {/* Genre Button — static Tailwind class, aman */}
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

        {/* Popular keywords */}
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

      {/* Genre Popup — rendered via Portal ke document.body */}
      {showGenre && <GenrePopup onClose={() => setShowGenre(false)} />}

      <BottomNav />
    </div>
  );
}
