import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";

const SANKA_BASE = "https://www.sankavollerei.com";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchSanka(path: string): Promise<any> {
  const res = await fetch(`${SANKA_BASE}${path}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sanka API error: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== "object") return [];
  for (const key of ["animeList", "list", "items", "data", "genreList", "genres", "results"]) {
    if (Array.isArray(data[key])) return data[key];
  }
  const values = Object.values(data);
  for (const v of values) {
    if (Array.isArray(v) && (v as unknown[]).length > 0) return v as unknown[];
  }
  return [];
}

export const animeRouter = createRouter({
  // Home - returns { ongoing, completed, newUpdate, hot }
  home: publicQuery.query(async () => {
    const result = await fetchSanka("/anime/home");
    const d = result.data || {};
    return {
      ongoing: d.ongoing?.animeList || [],
      completed: d.completed?.animeList || d.completeAnime?.animeList || [],
      newUpdate: d.newUpdate?.animeList || d.latestUpdate?.animeList || d.recent?.animeList || [],
      hot: d.hot?.animeList || d.popular?.animeList || d.topAnime?.animeList || [],
    };
  }),

  // Schedule - weekly release schedule
  schedule: publicQuery.query(async () => {
    const result = await fetchSanka("/anime/schedule");
    return result.data || [];
  }),

  // Search anime
  search: publicQuery
    .input(z.object({ keyword: z.string().min(1) }))
    .query(async ({ input }) => {
      const encoded = encodeURIComponent(input.keyword);
      const result = await fetchSanka(`/anime/search/${encoded}`);
      return extractArray(result.data);
    }),

  // Ongoing anime list
  ongoing: publicQuery
    .input(z.object({ page: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const result = await fetchSanka(`/anime/ongoing-anime?page=${page}`);
      return extractArray(result.data);
    }),

  // Completed anime list
  completed: publicQuery
    .input(z.object({ page: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const result = await fetchSanka(`/anime/complete-anime?page=${page}`);
      return extractArray(result.data);
    }),

  // Genre list
  genres: publicQuery.query(async () => {
    const result = await fetchSanka("/anime/genre");
    const raw = extractArray(result.data);
    // Deduplicate by id/slug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seen = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return raw.filter((g: any) => {
      const key = String(g.genreId || g.slug || g.id || g.title || g.name || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }),

  // Anime by genre
  genreAnime: publicQuery
    .input(z.object({ slug: z.string(), page: z.number().optional() }))
    .query(async ({ input }) => {
      const page = input.page || 1;
      const result = await fetchSanka(`/anime/genre/${input.slug}?page=${page}`);
      return extractArray(result.data);
    }),

  // Anime detail
  detail: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await fetchSanka(`/anime/anime/${input.slug}`);
      return result.data || null;
    }),

  // Episode detail with streaming links
  episode: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await fetchSanka(`/anime/episode/${input.slug}`);
      return result.data || null;
    }),

  // Server embed URL
  server: publicQuery
    .input(z.object({ serverId: z.string() }))
    .query(async ({ input }) => {
      const result = await fetchSanka(`/anime/server/${input.serverId}`);
      return result.data || null;
    }),

  // Batch download
  batch: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await fetchSanka(`/anime/batch/${input.slug}`);
      return result.data || null;
    }),

  // All anime list
  allAnime: publicQuery
    .input(z.object({ page: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const result = await fetchSanka(`/anime/unlimited?page=${page}`);
      return extractArray(result.data);
    }),
});
