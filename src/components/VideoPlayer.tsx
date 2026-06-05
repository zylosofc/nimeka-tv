import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Maximize, Minimize } from "lucide-react";

interface ServerItem { title: string; serverId: string; href: string; }
interface QualityServer { title: string; serverList: ServerItem[]; }
interface VideoPlayerProps {
  defaultUrl: string;
  qualities: QualityServer[];
  resumeTime?: number;
  onTimeUpdate?: (time: number) => void;
}

const QUALITY_ORDER = ["1080p", "720p", "480p", "360p", "HD", "SD"];
const PREFERRED_KEYWORDS = ["otakudesuhd", "ondesuhd", "desustream", "otakudesu"];

function isDirectStream(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase().split("?")[0];
  return u.endsWith(".mp4") || u.endsWith(".m3u8") || u.endsWith(".webm") || u.endsWith(".mkv");
}

function pickBestServer(qualities: QualityServer[]): ServerItem | null {
  if (!qualities?.length) return null;
  const sorted = [...qualities].sort((a, b) => {
    const ai = QUALITY_ORDER.indexOf(a.title), bi = QUALITY_ORDER.indexOf(b.title);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });
  for (const q of sorted)
    for (const kw of PREFERRED_KEYWORDS) {
      const s = q.serverList.find(s => s.title.toLowerCase().includes(kw));
      if (s) return s;
    }
  return sorted[0]?.serverList?.[0] || null;
}

async function fetchStreamUrl(serverId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/trpc/anime.server?input=${encodeURIComponent(JSON.stringify({ json: { serverId } }))}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.result?.data?.json?.url || json?.result?.data?.url || json?.data?.url || null;
  } catch { return null; }
}

// Coba semua server dari semua quality sampai dapat direct stream URL
async function findDirectStream(qualities: QualityServer[]): Promise<{ url: string; label: string } | null> {
  const sorted = [...qualities].sort((a, b) => {
    const ai = QUALITY_ORDER.indexOf(a.title), bi = QUALITY_ORDER.indexOf(b.title);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });

  // Debug: log semua quality dan server yang tersedia
  console.log("=== AVAILABLE QUALITIES ===", sorted.map(q => ({
    quality: q.title,
    servers: q.serverList.map(s => s.title)
  })));

  // Coba semua server dari quality tertinggi, tanpa filter keyword
  for (const q of sorted) {
    for (const s of q.serverList) {
      const url = await fetchStreamUrl(s.serverId);
      console.log(`Trying ${q.title} / ${s.title}:`, url?.slice(0, 80));
      if (url && isDirectStream(url)) {
        console.log("✅ Direct stream:", q.title, s.title, url.slice(0, 80));
        return { url, label: q.title };
      }
    }
  }
  // Kalau ga ada direct stream, return URL pertama yang berhasil (fallback ke iframe)
  const best = pickBestServer(qualities);
  if (best) {
    const url = await fetchStreamUrl(best.serverId);
    if (url) return { url, label: "" };
  }
  return null;
}

export default function VideoPlayer({ defaultUrl, qualities, resumeTime, onTimeUpdate }: VideoPlayerProps) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isDirect, setIsDirect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadedFor = useRef<string>("");

  useEffect(() => {
    const key = defaultUrl + (qualities?.length || 0);
    if (loadedFor.current === key) return;
    loadedFor.current = key;

    setLoading(true); setError(false); setStreamUrl(null);

    async function load() {
      if (qualities?.length) {
        const result = await findDirectStream(qualities);
        if (result) {
          setStreamUrl(result.url);
          setIsDirect(isDirectStream(result.url));
          setLoading(false);
          return;
        }
      }
      if (defaultUrl) {
        setStreamUrl(defaultUrl);
        setIsDirect(isDirectStream(defaultUrl));
        setLoading(false);
        return;
      }
      setError(true); setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultUrl, qualities]);

  // Resume time untuk native video
  useEffect(() => {
    if (videoRef.current && resumeTime && resumeTime > 5) {
      videoRef.current.currentTime = resumeTime;
    }
  }, [streamUrl, resumeTime]);

  // Time tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onTimeUpdate) return;
    const handler = () => onTimeUpdate(video.currentTime);
    video.addEventListener("timeupdate", handler);
    return () => video.removeEventListener("timeupdate", handler);
  }, [streamUrl, onTimeUpdate]);

  // Fullscreen
  const handleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => {
        // Lock landscape
        try { (window.screen.orientation as any)?.lock?.("landscape"); } catch {}
      }).catch(() => {
        // Fallback: native video fullscreen
        (videoRef.current as any)?.webkitEnterFullscreen?.();
      });
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div ref={wrapperRef}
      className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: "16/9" }}
    >
      {loading && (
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

      {streamUrl && isDirect ? (
        // Native video player — 1x klik, fullscreen support, fill bingkai
        <>
          <video
            ref={videoRef}
            src={streamUrl}
            controls
            autoPlay={false}
            playsInline
            className="w-full h-full"
            style={{ objectFit: "contain", background: "#000" }}
            onLoadedData={() => setLoading(false)}
            onError={() => {
              // Fallback ke iframe kalau video gagal load
              setIsDirect(false);
            }}
          />
          {/* Fullscreen button custom untuk landscape lock */}
          <button
            onClick={handleFullscreen}
            className="absolute bottom-12 right-2 z-20 p-2 bg-black/50 text-white rounded-lg opacity-0 hover:opacity-100 active:opacity-100 transition-opacity"
            title="Layar Penuh Landscape"
          >
            {isFullscreen
              ? <Minimize className="w-4 h-4" />
              : <Maximize className="w-4 h-4" />
            }
          </button>
        </>
      ) : streamUrl && !isDirect ? (
        // Iframe fallback untuk embed HTML
        <iframe
          src={streamUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="no-referrer-when-downgrade"
          title="Video Player"
          onLoad={() => setLoading(false)}
        />
      ) : null}
    </div>
  );
}
