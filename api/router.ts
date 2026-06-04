import { createRouter, publicQuery } from "./middleware";
import { animeRouter } from "./routers/anime";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  anime: animeRouter,
});

export type AppRouter = typeof appRouter;
