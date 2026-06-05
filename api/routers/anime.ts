import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";

const SANKA_BASE = "https://www.sankavollerei.com";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchSanka(path: string): Promise<any> {
  const res = await fetch(`${SANKA_BASE}${path}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
      "Referer": "https://otakudesu.cloud/",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sanka error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== "object") return [];
  // Common nested key names
  for (const key of ["animeList", "anime_list", "list", "items", "data", "genreList", "genres", "results", "search"]) {
    if (Array.isArray(data[key])) return data[key];
  }
  // Fallback: first array value in object
  for (const v of Object.values(data)) {
    if (Array.isArray(v) && (v as unknown[]).length > 0) return v as any[];
  }
  return [];
}

export const animeRouter = createRouter({
  // Home data
  home: publicQuery.query(async () => {
    const result = await fetchSanka("/anime/home");
    const d = result.data || {};
    return {
      ongoing: d.ongoing?.animeList || extractArray(d.ongoing) || [],
      completed: d.completed?.animeList || d.completeAnime?.animeList || extractArray(d.completed) || [],
      newUpdate: d.newUpdate?.animeList || d.latestUpdate?.animeList || d.recent?.animeList || extractArray(d.newUpdate) || [],
      hot: d.hot?.animeList || d.popular?.animeList || d.topAnime?.animeList || extractArray(d.hot) || [],
    };
  }),

  // Schedule
  schedule: publicQuery.query(async () => {
    const result = await fetchSanka("/anime/schedule");
    return result.data || [];
  }),

  // Search — coba beberapa path agar data lebih lengkap
  search: publicQuery
    .input(z.object({ keyword: z.string().min(1) }))
    .query(async ({ input }) => {
      const kw = input.keyword;
      const encoded = encodeURIComponent(kw);

      // Coba semua endpoint search, return yang pertama berhasil dengan data
      const paths = [
        `/anime/search/${encoded}`,
        `/anime/search?q=${encoded}`,
        `/anime/search?keyword=${encoded}`,
        `/search/${encoded}`,
      ];

      for (const path of paths) {
        try {
          const result = await fetchSanka(path);
          const list = extractArray(result.data || result);
          if (list.length > 0) return list;
        } catch {
          // try next
        }
      }
      return [];
    }),

  // Ongoing anime
  ongoing: publicQuery
    .input(z.object({ page: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const paths = [
        `/anime/ongoing-anime?page=${page}`,
        `/anime/ongoing?page=${page}`,
        `/anime/airing?page=${page}`,
      ];
      for (const path of paths) {
        try {
          const result = await fetchSanka(path);
          const list = extractArray(result.data);
          if (list.length > 0) return list;
        } catch { /* try next */ }
      }
      // fallback ke home ongoing
      if (page === 1) {
        try {
          const result = await fetchSanka("/anime/home");
          const d = result.data || {};
          const list = d.ongoing?.animeList || extractArray(d.ongoing);
          if (list?.length > 0) return list;
        } catch { /* ignore */ }
      }
      return [];
    }),

  // Completed anime
  completed: publicQuery
    .input(z.object({ page: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const paths = [
        `/anime/complete-anime?page=${page}`,
        `/anime/completed-anime?page=${page}`,
        `/anime/completed?page=${page}`,
        `/anime/tamat?page=${page}`,
      ];
      for (const path of paths) {
        try {
          const result = await fetchSanka(path);
          const list = extractArray(result.data);
          if (list.length > 0) return list;
        } catch { /* try next */ }
      }
      return [];
    }),

  // All anime
  allAnime: publicQuery
    .input(z.object({ page: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const paths = [
        `/anime/unlimited?page=${page}`,
        `/anime/anime-list?page=${page}`,
        `/anime/list?page=${page}`,
        `/anime/all?page=${page}`,
      ];
      for (const path of paths) {
        try {
          const result = await fetchSanka(path);
          const list = extractArray(result.data);
          if (list.length > 0) return list;
        } catch { /* try next */ }
      }
      return [];
    }),

  // Genres — coba beberapa path
  genres: publicQuery.query(async () => {
    const paths = ["/anime/genre", "/anime/genres", "/genre", "/genres"];
    for (const path of paths) {
      try {
        const result = await fetchSanka(path);
        const raw = extractArray(result.data || result);
        if (raw.length > 0) {
          // Deduplicate
          const seen = new Set<string>();
          return raw.filter((g: any) => {
            const key = String(g.genreId || g.slug || g.id || g.title || g.name || "");
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }
      } catch { /* try next */ }
    }
    return [];
  }),

  // Anime by genre
  genreAnime: publicQuery
    .input(z.object({ slug: z.string(), page: z.number().optional() }))
    .query(async ({ input }) => {
      const page = input.page || 1;
      const paths = [
        `/anime/genre/${input.slug}?page=${page}`,
        `/genre/${input.slug}?page=${page}`,
      ];
      for (const path of paths) {
        try {
          const result = await fetchSanka(path);
          const list = extractArray(result.data);
          if (list.length > 0) return list;
        } catch { /* try next */ }
      }
      return [];
    }),

  // Anime detail
  detail: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const paths = [`/anime/anime/${input.slug}`, `/anime/${input.slug}`];
      for (const path of paths) {
        try {
          const result = await fetchSanka(path);
          if (result.data) return result.data;
        } catch { /* try next */ }
      }
      return null;
    }),

  // Episode detail
  episode: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const paths = [`/anime/episode/${input.slug}`, `/episode/${input.slug}`];
      for (const path of paths) {
        try {
          const result = await fetchSanka(path);
          if (result.data) return result.data;
        } catch { /* try next */ }
      }
      return null;
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
});
