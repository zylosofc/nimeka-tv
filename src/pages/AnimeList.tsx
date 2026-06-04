import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/LoadingSpinner";
import { Tv, CheckCircle2, List, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

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
    if (filterParam && filterParam !== filter) {
      setFilter(filterParam);
      setPage(1);
    }
  }, [filterParam]); // eslint-disable-line

  const ongoingQuery = trpc.anime.ongoing.useQuery({ page }, { enabled: filter === "ongoing" });
  const completedQuery = trpc.anime.completed.useQuery({ page }, { enabled: filter === "completed" });
  // "all" pakai ongoing + completed gabungan dari home, atau fallback ke ongoing
  const allOngoing = trpc.anime.ongoing.useQuery({ page }, { enabled: filter === "all" });
  const allCompleted = trpc.anime.completed.useQuery({ page }, { enabled: filter === "all" });

  const getData = (): AnimeItem[] => {
    if (filter === "ongoing") return (ongoingQuery.data as AnimeItem[]) || [];
    if (filter === "completed") return (completedQuery.data as AnimeItem[]) || [];
    // Gabung ongoing + completed untuk tab "Semua"
    const a = (allOngoing.data as AnimeItem[]) || [];
    const b = (allCompleted.data as AnimeItem[]) || [];
    return [...a, ...b];
  };

  const getLoading = (): boolean => {
    if (filter === "ongoing") return ongoingQuery.isLoading;
    if (filter === "completed") return completedQuery.isLoading;
    return allOngoing.isLoading || allCompleted.isLoading;
  };

  const getError = () => {
    if (filter === "ongoing") return ongoingQuery.error;
    if (filter === "completed") return completedQuery.error;
    return allOngoing.error || allCompleted.error;
  };

  const refetchAll = () => {
    if (filter === "ongoing") ongoingQuery.refetch();
    else if (filter === "completed") completedQuery.refetch();
    else { allOngoing.refetch(); allCompleted.refetch(); }
  };

  const animeList = getData();
  const isLoading = getLoading();
  const error = getError();

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
                  : "bg-[#1a1a2e] text-gray-400 hover:bg-[#252540] border border-white/5"
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <SkeletonGrid count={12} />
        ) : error ? (
          <div className="text-center py-16">
            <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">Gagal memuat anime</p>
            <button onClick={refetchAll} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg mx-auto">
              <RefreshCw className="w-4 h-4" />Coba Lagi
            </button>
          </div>
        ) : animeList.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {animeList.map((anime: AnimeItem, i: number) => (
              <AnimeCard key={`${anime.animeId}-${i}`} anime={anime} index={i} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">Tidak ada anime</p>
            <button onClick={refetchAll} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg mx-auto">
              <RefreshCw className="w-4 h-4" />Muat Ulang
            </button>
          </div>
        )}

        {/* Pagination */}
        {animeList.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-8 pb-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 bg-[#1a1a2e] text-gray-300 rounded-lg disabled:opacity-40 hover:bg-[#252540] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />Sebelumnya
            </button>
            <span className="text-sm text-gray-400 px-2 py-1 bg-[#1a1a2e] rounded-lg">Hal {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-4 py-2 bg-[#1a1a2e] text-gray-300 rounded-lg hover:bg-[#252540] transition-colors"
            >
              Selanjutnya<ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
