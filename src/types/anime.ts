export interface AnimeItem {
  title: string;
  poster: string;
  episodes?: number;
  releaseDay?: string;
  latestReleaseDate?: string;
  animeId: string;
  href: string;
  otakudesuUrl?: string;
  slug?: string;
  url?: string;
  score?: string;
  status?: string;
  type?: string;
}

export interface ScheduleDay {
  day: string;
  anime_list: {
    title: string;
    slug: string;
    url: string;
    poster: string;
  }[];
}

export interface Genre {
  title: string;
  genreId: string;
  href: string;
  otakudesuUrl?: string;
}

export interface Episode {
  title: string;
  eps: number;
  date: string;
  episodeId: string;
  href: string;
  otakudesuUrl?: string;
}

export interface AnimeDetail {
  title: string;
  poster: string;
  japanese: string;
  score: string;
  producers: string;
  type: string;
  status: string;
  episodes: number;
  duration: string;
  aired: string;
  studios: string;
  batch: string | null;
  synopsis: {
    paragraphs: string[];
    connections: string[];
  };
  genreList: Genre[];
  episodeList: Episode[];
  recommendedAnimeList: AnimeItem[];
}

export interface ServerItem {
  title: string;
  serverId: string;
  href: string;
}

export interface QualityServer {
  title: string;
  serverList: ServerItem[];
}

export interface EpisodeDetail {
  title: string;
  animeId: string;
  releaseTime: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode: {
    title: string;
    episodeId: string;
    href: string;
    otakudesuUrl: string;
  } | null;
  hasNextEpisode: boolean;
  nextEpisode: {
    title: string;
    episodeId: string;
    href: string;
    otakudesuUrl: string;
  } | null;
  server: {
    qualities: QualityServer[];
  };
  downloadUrl: {
    qualities: {
      title: string;
      size: string;
      urls: { title: string; url: string }[];
    }[];
  };
  info?: {
    title: string;
    poster: string;
    animeId: string;
  };
}

export interface SearchResult {
  title: string;
  poster: string;
  status: string;
  score: string;
  animeId: string;
  href: string;
  otakudesuUrl?: string;
  genres?: string[];
}
