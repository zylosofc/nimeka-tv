import { useState } from "react";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/LoadingSpinner";
import { Search as SearchIcon, X, Loader2, ArrowLeft } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router";

/* eslint-disable @typescript-eslint/no-explicit-any */

const popularKeywords = [
  "One Piece", "Jujutsu Kaisen", "Demon Slayer", "Naruto",
  "Attack on Titan", "Solo Leveling", "Bleach", "Re:Zero",
  "Haikyuu", "Sword Art Online",
];

function GenrePage({ onClose }: { onClose: () => void }) {
  const { data, isLoading, refetch } = trpc.anime.genres.useQuery();

  let genres: any[] = [];
  if (Array.isArray(data)) genres = data;
  else if (data && typeof data === "object") {
    const d = data as any;
    genres = d.genreList || d.genres || d.list || d.data || [];
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f0f1a", color: "#fff", paddingBottom: 80 }}>
      <Header />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 12px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onClose} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 12px", borderRadius: 10,
            background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)",
            color: "#d1d5db", fontSize: 13, cursor: "pointer"
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Kembali
          </button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Daftar Genre</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} style={{ height: 44, borderRadius: 10, background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && genres.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#6b7280", marginBottom: 12 }}>Genre tidak tersedia</p>
            <button onClick={() => refetch()} style={{
              padding: "8px 20px", background: "#7c3aed", color: "#fff",
              borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13
            }}>Muat Ulang</button>
          </div>
        )}

        {/* Genre list — flat, no colors, no transitions */}
        {!isLoading && genres.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {genres.map((g: any, i: number) => {
              const id = String(g.genreId || g.slug || g.id || i);
              const name = String(g.title || g.name || id);
              return (
                <Link key={`${id}-${i}`} to={`/genre/${id}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: 10, textDecoration: "none",
                  background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)",
                  color: "#e5e7eb", fontSize: 14, fontWeight: 500
                }}>
                  <span>{name}</span>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>›</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
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
