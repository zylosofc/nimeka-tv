import { useState } from "react";
import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnimeCard from "@/components/AnimeCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Schedule() {
  const { data, isLoading } = trpc.anime.schedule.useQuery();
  const [selectedDay, setSelectedDay] = useState(() => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[new Date().getDay()];
  });

  const schedule = data as any[];
  const currentSchedule = schedule?.find((s: any) => s.day === selectedDay);

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">
        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold">Jadwal Rilis</h1>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {dayNames.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 text-sm rounded-xl whitespace-nowrap transition-all ${
                selectedDay === day
                  ? "bg-purple-600 text-white font-medium"
                  : "bg-[#1a1a2e] text-gray-400 hover:bg-[#252540]"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Anime List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : currentSchedule?.anime_list?.length > 0 ? (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            {currentSchedule.anime_list.map((anime: any, i: number) => (
              <AnimeCard
                key={anime.slug}
                anime={{
                  title: anime.title,
                  poster: anime.poster,
                  animeId: anime.slug,
                  href: anime.url,
                }}
                index={i}
                variant="schedule"
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada anime yang rilis hari {selectedDay}</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
