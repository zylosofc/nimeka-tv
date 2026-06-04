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

const genreColors = [
  "bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20",
  "bg-green-500/10 text-green-300 border-green-500/20 hover:bg-green-500/20",
  "bg-yellow-500/10 text-yellow-300 border-yellow-500/20 hover:bg-yellow-500/20",
  "bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20",
  "bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20",
  "bg-pink-500/10 text-pink-300 border-pink-500/20 hover:bg-pink-500/20",
  "bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20",
  "bg-orange-500/10 text-orange-300 border-orange-500/20 hover:bg-orange-500/20",
  "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20",
  "bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/20",
  "bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20",
  "bg-teal-500/10 text-teal-300 border-teal-500/20 hover:bg-teal-500/20",
  "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20",
  "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20",
];

function GenreSheet({ onClose }: { onClose: () => void }) {
  const { data, isLoading, refetch } = trpc.anime.genres.useQuery();
  const genres = (data as any[]) || [];

  return (
    // Backdrop — pakai pointer-events instead of overflow:hidden agar tidak glitch
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      {/* Sheet — stop propagation agar klik di dalam tidak nutup */}
      <div
        className="bg-[#13131f] rounded-t-2xl border-t border-white/10 flex flex-col"
        style={{
          maxHeight: "78vh",
          animation: "slideUp 0.22s ease-out",
          // Penting: akan-tetap dalam stacking context sendiri
          isolation: "isolate",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex-shrink-0 flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Daftar Genre</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Scrollable genre list */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : genres.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">Genre tidak tersedia</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">
                Muat Ulang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-6">
              {genres.map((g: any, i: number) => {
                const id = String(g.genreId || g.slug || g.id || i);
                const name = String(g.title || g.name || id);
                return (
                  <Link
                    key={`${id}-${i}`}
                    to={`/genre/${id}`}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium active:scale-95 transition-all ${genreColors[i % genreColors.length]}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
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
