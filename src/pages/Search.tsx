import { useState } from "react";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/LoadingSpinner";
import { Search as SearchIcon, X } from "lucide-react";

interface SearchResult {
  title: string;
  poster: string;
  animeId: string;
  href: string;
  status: string;
  score: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");

  const { data: results, isLoading } = trpc.anime.search.useQuery(
    { keyword },
    { enabled: keyword.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setKeyword(query.trim());
  };

  const popularKeywords = ["One Piece", "Jujutsu Kaisen", "Demon Slayer", "Naruto", "Attack on Titan"];

  const searchResults: SearchResult[] = (results as SearchResult[]) || [];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari anime..."
            className="w-full h-12 pl-12 pr-12 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setKeyword(""); }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          )}
        </form>

        {/* Popular Keywords */}
        {!keyword && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-3">Pencarian Populer</h2>
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((k) => (
                <button
                  key={k}
                  onClick={() => { setQuery(k); setKeyword(k); }}
                  className="px-3 py-1.5 text-sm bg-[#1a1a2e] text-gray-300 rounded-lg border border-white/5 hover:border-purple-500/30 hover:text-purple-300 transition-all"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {keyword && (
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3">
              Hasil pencarian untuk &quot;{keyword}&quot;
              {searchResults && ` (${searchResults.length})`}
            </h2>
            {isLoading ? (
              <SkeletonGrid count={8} />
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {searchResults.map((anime: SearchResult, i: number) => (
                  <AnimeCard
                    key={anime.animeId}
                    anime={{
                      title: anime.title,
                      poster: anime.poster,
                      animeId: anime.animeId,
                      href: anime.href,
                      status: anime.status,
                      score: anime.score,
                    }}
                    index={i}
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

      <BottomNav />
    </div>
  );
}
