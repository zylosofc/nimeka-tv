import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/LoadingSpinner";
import { Tv, CheckCircle2, List, ChevronLeft, ChevronRight } from "lucide-react";

type FilterType = "ongoing" | "completed" | "all";

interface AnimeItem {
  title: string;
  poster: string;
  animeId: string;
  href: string;
  episodes?: number;
  score?: string;
  status?: string;
  releaseDay?: string;
  type?: string;
}

export default function AnimeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter") as FilterType | null;
  const [filter, setFilter] = useState<FilterType>(filterParam || "ongoing");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (filterParam) setFilter(filterParam);
  }, [filterParam]);

  const ongoingQuery = trpc.anime.ongoing.useQuery({ page }, { enabled: filter === "ongoing" });
  const completedQuery = trpc.anime.completed.useQuery({ page }, { enabled: filter === "completed" });
  const allQuery = trpc.anime.allAnime.useQuery({ page }, { enabled: filter === "all" });

  const getData = (): AnimeItem[] => {
    if (filter === "ongoing") return (ongoingQuery.data as AnimeItem[]) || [];
    if (filter === "completed") return (completedQuery.data as AnimeItem[]) || [];
    return (allQuery.data as AnimeItem[]) || [];
  };

  const getLoading = (): boolean => {
    if (filter === "ongoing") return ongoingQuery.isLoading;
    if (filter === "completed") return completedQuery.isLoading;
    return allQuery.isLoading;
  };

  const animeList = getData();
  const isLoading = getLoading();

  const filters: { key: FilterType; label: string; icon: typeof Tv }[] = [
    { key: "ongoing", label: "Ongoing", icon: Tv },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
    { key: "all", label: "Semua", icon: List },
  ];

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setPage(1);
    setSearchParams({ filter: f });
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <Tv className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold">Daftar Anime</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl transition-all ${
                filter === f.key
                  ? "bg-purple-600 text-white font-medium"
                  : "bg-[#1a1a2e] text-gray-400 hover:bg-[#252540]"
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Anime Grid */}
        {isLoading ? (
          <SkeletonGrid count={12} />
        ) : animeList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {animeList.map((anime: AnimeItem, i: number) => (
              <AnimeCard
                key={anime.animeId || i}
                anime={anime}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada anime</p>
          </div>
        )}

        {/* Pagination */}
        {animeList.length > 0 && (
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
