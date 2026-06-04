import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Maximize2 } from "lucide-react";

interface ServerItem {
  title: string;
  serverId: string;
  href: string;
}

interface QualityServer {
  title: string;
  serverList: ServerItem[];
}

interface VideoPlayerProps {
  defaultUrl: string;
  qualities: QualityServer[];
  startAtSeconds?: number;
  onProgress?: (seconds: number) => void;
}

const QUALITY_ORDER = ["1080p", "720p", "480p", "360p", "HD", "SD"];
const PREFERRED_KEYWORDS = ["otakudesuhd", "ondesuhd", "desustream", "otakudesu", "neonime", "samehadaku"];

function pickBestServer(qualities: QualityServer[]): ServerItem | null {
  if (!qualities || qualities.length === 0) return null;
  const sorted = [...qualities].sort((a, b) => {
    const ai = QUALITY_ORDER.indexOf(a.title);
    const bi = QUALITY_ORDER.indexOf(b.title);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  for (const q of sorted) {
    for (const kw of PREFERRED_KEYWORDS) {
      const s = q.serverList.find((s) => s.title.toLowerCase().includes(kw));
      if (s) return s;
    }
  }
  return sorted[0]?.serverList?.[0] || null;
}

async function fetchEmbedUrl(serverId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/trpc/anime.server?input=${encodeURIComponent(JSON.stringify({ serverId }))}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.result?.data?.url || json?.data?.url || null;
  } catch {
    return null;
  }
}

export default function VideoPlayer({ defaultUrl, qualities, startAtSeconds = 0, onProgress }: VideoPlayerProps) {
  const best = pickBestServer(qualities);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const accumulatedRef = useRef<number>(startAtSeconds);

  // Progress tracking
  useEffect(() => {
    if (!onProgress || loading || error) return;
    startTimeRef.current = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      onProgress(Math.floor(accumulatedRef.current + elapsed));
    }, 5000);
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        accumulatedRef.current += elapsed;
      }
    };
  }, [loading, error, onProgress]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setEmbedUrl(null);
    accumulatedRef.current = startAtSeconds;
    async function load() {
      if (best?.serverId) {
        const url = await fetchEmbedUrl(best.serverId);
        if (url) { setEmbedUrl(url); return; }
      }
      if (defaultUrl) { setEmbedUrl(defaultUrl); return; }
      setError(true);
      setLoading(false);
    }
    load();
  }, [qualities, defaultUrl, startAtSeconds]); // eslint-disable-line

  // Fullscreen → force landscape on mobile
  const handleFullscreen = useCallback(() => {
    const iframe = iframeRef.current;
    const wrapper = wrapperRef.current;
    if (!iframe || !wrapper) return;

    // Coba lock orientation ke landscape
    const lockLandscape = () => {
      try {
        const screen = window.screen as Screen & {
          orientation?: { lock?: (o: string) => Promise<void> };
        };
        if (screen.orientation?.lock) {
          screen.orientation.lock("landscape").catch(() => {});
        }
      } catch {}
    };

    // Fullscreen API - prefer iframe fullscreen agar overlay hilang
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen().then(lockLandscape).catch(() => {
        // fallback: fullscreen wrapper div
        wrapper.requestFullscreen?.().then(lockLandscape).catch(() => {});
      });
    } else if ((iframe as HTMLIFrameElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
      (iframe as HTMLIFrameElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen?.();
      lockLandscape();
    } else if ((wrapper as HTMLDivElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
      (wrapper as HTMLDivElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen?.();
      lockLandscape();
    }
  }, []);

  // Listen fullscreenchange to unlock orientation when exiting
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        try {
          const screen = window.screen as Screen & {
            orientation?: { unlock?: () => void };
          };
          screen.orientation?.unlock?.();
        } catch {}
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group">
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-2">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-xs text-gray-500">Memuat video...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <span className="text-xs text-gray-500">Video tidak tersedia</span>
        </div>
      )}
      {embedUrl && (
        <>
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-presentation allow-forms"
            title="Video Player"
            onLoad={() => setLoading(false)}
          />
          {/* Custom fullscreen button - tampil saat hover */}
          <button
            onClick={handleFullscreen}
            className="absolute bottom-3 right-3 z-20 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            title="Layar Penuh (Landscape)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
