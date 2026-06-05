import { useState, useCallback, useRef } from "react";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/LoadingSpinner";
import { Search as SearchIcon, X, Loader2, Compass, Tag, ChevronRight, ArrowLeft } from "lucide-react";
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

// Genre page — tidak pakai popup/portal/fixed overlay sama sekali
// Langsung render sebagai page terpisah dalam komponen yang sama
function GenrePage({ onClose }: { onClose: () => void }) {
  const { data, isLoading, refetch } = trpc.anime.genres.useQuery();

  let genres: any[] = [];
  if (Array.isArray(data)) genres = data;
  else if (data && typeof data === "object") {
    const d = data as any;
    genres = d.genreList || d.genres || d.list || d.data || [];
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* Back button */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2e] text-gray-300 rounded-xl hover:bg-[#252540] transition-colors text-sm border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-bold">Daftar Genre</h1>
          </div>
          {!isLoading && (
            <button
              onClick={() => refetch()}
              className="ml-auto p-2 text-gray-500 hover:text-white transition-colors"
              title="Refresh"
            >
              <X className="w-4 h-4 rotate-45" />
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-11 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error / empty */}
        {!isLoading && genres.length === 0 && (
          <div className="text-center py-16">
            <Compass className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Genre tidak tersedia</p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {/* Genre grid */}
        {!isLoading && genres.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {genres.map((g: any, i: number) => {
              const id = String(g.genreId || g.slug || g.id || i);
              const name = String(g.title || g.name || id);
              const iconColor = ICON_COLORS[i % ICON_COLORS.length];
              return (
                <Link
                  key={`${id}-${i}`}
                  to={`/genre/${id}`}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:border-purple-500/30 transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", textDecoration: "none" }}
                >
                  <Tag style={{ width: 13, height: 13, flexShrink: 0, color: iconColor }} />
                  <span className="text-sm font-medium text-gray-200 truncate">{name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
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

  // Tampilkan genre page full (tidak pakai popup/overlay)
  if (showGenre) {
    return <GenrePage onClose={() => setShowGenre(false)} />;
  }

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

      <BottomNav />
    </div>
  );
}
