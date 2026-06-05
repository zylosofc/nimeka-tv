import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Maximize } from "lucide-react";

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
  resumeTime?: number;
  onTimeUpdate?: (time: number) => void;
}

const QUALITY_ORDER = ["1080p", "720p", "480p", "360p", "HD", "SD"];
const PREFERRED_KEYWORDS = ["otakudesuhd", "ondesuhd", "desustream", "otakudesu"];

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
    const res = await fetch(`/api/trpc/anime.server?input=${encodeURIComponent(JSON.stringify({ json: { serverId } }))}`);
    if (!res.ok) return null;
    const json = await res.json();
    const url = json?.result?.data?.json?.url || json?.result?.data?.url || json?.data?.url || null;
    console.log("=== STREAM URL ===", url);
    console.log("=== RAW RESPONSE ===", JSON.stringify(json).slice(0, 300));
    return url;
  } catch (e) {
    console.log("=== FETCH ERROR ===", e);
    return null;
  }
}

export default function VideoPlayer({ defaultUrl, qualities, resumeTime, onTimeUpdate }: VideoPlayerProps) {
  const best = pickBestServer(qualities);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setEmbedUrl(null);

    async function load() {
      if (best?.serverId) {
        const url = await fetchEmbedUrl(best.serverId);
        if (url) {
          console.log("=== STREAM URL ===", url);
          console.log("=== SERVER ===", best.title, best.serverId);
          const finalUrl =
            resumeTime && resumeTime > 5
              ? url + (url.includes("?") ? `&t=${Math.floor(resumeTime)}` : `?t=${Math.floor(resumeTime)}`)
              : url;
          setEmbedUrl(finalUrl);
          return;
        }
      }
      if (defaultUrl) {
        const finalUrl =
          resumeTime && resumeTime > 5
            ? defaultUrl + (defaultUrl.includes("?") ? `&t=${Math.floor(resumeTime)}` : `?t=${Math.floor(resumeTime)}`)
            : defaultUrl;
        setEmbedUrl(finalUrl);
        return;
      }
      // Both server and defaultUrl failed
      setError(true);
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qualities, defaultUrl]);

  // Listen to postMessage from iframe for time tracking
  useEffect(() => {
    if (!onTimeUpdate) return;
    const handler = (e: MessageEvent) => {
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (d?.currentTime && typeof d.currentTime === "number") {
          onTimeUpdate(d.currentTime);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onTimeUpdate]);

  // Custom fullscreen handler — satu tombol saja
  const handleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {
        // fallback: request fullscreen on iframe directly
        iframeRef.current?.requestFullscreen?.();
      });
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group"
    >
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
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          // allowFullScreen dihapus — pakai custom fullscreen button kita
          allow="autoplay; picture-in-picture; encrypted-media; gyroscope; accelerometer"
          referrerPolicy="no-referrer-when-downgrade"
          title="Video Player"
          onLoad={() => setLoading(false)}
        />
      )}
    </div>
  );
}
