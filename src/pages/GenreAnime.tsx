import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/LoadingSpinner";
import { Tag, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface AnimeItem {
  title: string;
  poster: string;
  animeId: string;
  href: string;
  score?: string;
  status?: string;
  episodes?: number;
}

export default function GenreAnime() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: animeList, isLoading } = trpc.anime.genreAnime.useQuery(
    { slug: slug || "", page },
    { enabled: !!slug }
  );

  const genreName = slug
    ? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "";

  const animeItems: AnimeItem[] = (animeList as AnimeItem[]) || [];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/genres"
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a2e] text-gray-300 rounded-lg hover:bg-[#252540] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Genre
          </Link>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold">{genreName}</h1>
          </div>
        </div>

        {/* Anime Grid */}
        {isLoading ? (
          <SkeletonGrid count={12} />
        ) : animeItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {animeItems.map((anime: AnimeItem, i: number) => (
              <AnimeCard
                key={anime.animeId}
                anime={anime}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Tag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada anime dalam genre ini</p>
          </div>
        )}

        {/* Pagination */}
        {animeItems.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 bg-[#1a1a2e] text-gray-300 rounded-lg disabled:opacity-40 hover:bg-[#252540] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>
            <span className="text-sm text-gray-400">Halaman {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-4 py-2 bg-[#1a1a2e] text-gray-300 rounded-lg hover:bg-[#252540] transition-colors"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
