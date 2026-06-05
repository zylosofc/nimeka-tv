import { trpc } from "@/providers/trpc";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { Link } from "react-router";
import { Compass, Tag, RefreshCw, Loader2 } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Semua warna pakai inline style — tidak bisa di-purge Tailwind
const COLORS = [
  { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   icon: "#f87171" },
  { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",   icon: "#4ade80" },
  { bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.25)",   icon: "#facc15" },
  { bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.25)",  icon: "#c084fc" },
  { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)",  icon: "#60a5fa" },
  { bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.25)",  icon: "#f472b6" },
  { bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.25)",   icon: "#22d3ee" },
  { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.25)",  icon: "#818cf8" },
  { bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.25)",  icon: "#fb923c" },
  { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)",  icon: "#34d399" },
  { bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.25)",  icon: "#a78bfa" },
  { bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.25)",  icon: "#2dd4bf" },
  { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)",  icon: "#fbbf24" },
  { bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.25)",   icon: "#fb7185" },
  { bg: "rgba(217,70,239,0.12)",  border: "rgba(217,70,239,0.25)",  icon: "#e879f9" },
];

export default function Genres() {
  const { data, isLoading, error, refetch } = trpc.anime.genres.useQuery();

  let genres: any[] = [];
  if (Array.isArray(data)) {
    genres = data;
  } else if (data && typeof data === "object") {
    const d = data as any;
    genres = d.genreList || d.genres || d.list || d.data || [];
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4">

        {/* Page title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Compass style={{ width: 20, height: 20, color: "#a78bfa" }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Daftar Genre</h1>
          {!isLoading && (
            <button
              onClick={() => refetch()}
              style={{
                marginLeft: "auto", padding: 6, borderRadius: 8,
                background: "transparent", border: "none", cursor: "pointer", color: "#6b7280"
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 10 }}>
            <Loader2 style={{ width: 32, height: 32, color: "#7c3aed", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>Memuat genre...</span>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Compass style={{ width: 48, height: 48, color: "#374151", margin: "0 auto 12px" }} />
            <p style={{ color: "#6b7280", marginBottom: 12 }}>Gagal memuat genre</p>
            <button
              onClick={() => refetch()}
              style={{
                padding: "8px 20px", background: "#7c3aed", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer"
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Genre Grid — 100% inline style */}
        {!isLoading && !error && genres.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 10,
          }}
          >
            {genres.map((genre: any, i: number) => {
              const id = String(genre.genreId || genre.slug || genre.id || i);
              const name = String(genre.title || genre.name || genre.label || id);
              const c = COLORS[i % COLORS.length];
              return (
                <Link
                  key={`${id}-${i}`}
                  to={`/genre/${id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 12,
                      backgroundColor: c.bg,
                      border: `1px solid ${c.border}`,
                      transition: "transform 0.15s, opacity 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <Tag style={{ width: 14, height: 14, flexShrink: 0, color: c.icon }} />
                    <span style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#e5e7eb",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && genres.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Compass style={{ width: 48, height: 48, color: "#374151", margin: "0 auto 12px" }} />
            <p style={{ color: "#6b7280", marginBottom: 12 }}>Genre tidak tersedia</p>
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
        )}
      </main>

      <BottomNav />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
