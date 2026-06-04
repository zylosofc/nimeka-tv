import { useState, useCallback, useEffect, useRef } from "react";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/LoadingSpinner";
import { Search as SearchIcon, X, Loader2, Compass, Tag, ChevronRight, ArrowLeft } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router";

/* eslint-disable @typescript-eslint/no-explicit-any */

const popularKeywords = ["One Piece", "Jujutsu Kaisen", "Demon Slayer", "Naruto", "Attack on Titan", "Solo Leveling", "Bleach", "Re:Zero", "Haikyuu", "Sword Art Online"];

const genreColors = [
  "bg-red-500/15 text-red-300 border-red-500/25",
  "bg-green-500/15 text-green-300 border-green-500/25",
  "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "bg-blue-500/15 text-blue-300 border-blue-500/25",
  "bg-pink-500/15 text-pink-300 border-pink-500/25",
  "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  "bg-violet-500/15 text-violet-300 border-violet-500/25",
  "bg-rose-500/15 text-rose-300 border-rose-500/25",
  "bg-teal-500/15 text-teal-300 border-teal-500/25",
  "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
  "bg-amber-500/15 text-amber-300 border-amber-500/25",
];

function GenreSheet({ onClose }: { onClose: () => void }) {
  const { data, isLoading, refetch } = trpc.anime.genres.useQuery();
  const genres = (data as any[]) || [];
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div
        ref={sheetRef}
        className="bg-[#13131f] rounded-t-2xl border-t border-white/10 max-h-[80vh] flex flex-col"
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        {/* Handle + Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-white/5 flex-shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Daftar Genre</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Genre grid */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : genres.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">Genre tidak tersedia</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">Muat Ulang</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-4">
              {genres.map((g: any, i: number) => {
                const id = String(g.genreId || g.slug || g.id || i);
                const name = String(g.title || g.name || id);
                return (
                  <Link
                    key={`${id}-${i}`}
                    to={`/genre/${id}`}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium active:scale-95 transition-transform ${genreColors[i % genreColors.length]}`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Compass className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Jelajahi Genre</p>
              <p className="text-xs text-gray-500">Action, Romance, Fantasy, dll</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>

        {/* Idle state - popular keywords */}
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
              <div className="flex items-center gap-2 mb-3">
                {query !== debouncedQuery ? null : (
                  <button onClick={handleClear} className="p-1 rounded hover:bg-white/10">
                    <ArrowLeft className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <h2 className="text-sm font-medium text-gray-400">
                  Hasil &ldquo;{debouncedQuery}&rdquo;
                  {searchResults.length > 0 && <span className="ml-1 text-purple-400">({searchResults.length})</span>}
                </h2>
              </div>
            )}
            {isSearching ? (
              <SkeletonGrid count={8} />
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                {searchResults.map((anime: any, i: number) => (
                  <AnimeCard
                    key={anime.animeId || i}
                    anime={anime}
                    index={i}
                    variant="grid"
                  />
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

      {/* Genre Bottom Sheet */}
      {showGenre && <GenreSheet onClose={() => setShowGenre(false)} />}

      <BottomNav />
    </div>
  );
}
