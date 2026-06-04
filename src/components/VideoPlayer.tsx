import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface ServerItem { title: string; serverId: string; href: string; }
interface QualityServer { title: string; serverList: ServerItem[]; }
interface VideoPlayerProps {
  defaultUrl: string;
  qualities: QualityServer[];
  startAtSeconds?: number;
  onProgress?: (seconds: number) => void;
}

const QUALITY_ORDER = ["1080p", "720p", "480p", "360p", "HD", "SD"];
const PREFERRED_KEYWORDS = ["otakudesuhd", "ondesuhd", "desustream", "otakudesu", "neonime", "samehadaku"];

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
      const s = q.serverList.find((s) => s.title.toLowerCase().includes(kw));
      if (s) return s;
    }
  return sorted[0]?.serverList?.[0] || null;
}

async function fetchEmbedUrl(serverId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/trpc/anime.server?input=${encodeURIComponent(JSON.stringify({ serverId }))}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.result?.data?.url || json?.data?.url || null;
  } catch { return null; }
}

function lockLandscape() {
  try {
    const orient = (window.screen as any).orientation;
    if (orient?.lock) orient.lock("landscape").catch(() => {});
  } catch {}
}

function unlockOrientation() {
  try {
    const orient = (window.screen as any).orientation;
    if (orient?.unlock) orient.unlock();
  } catch {}
}

export default function VideoPlayer({ defaultUrl, qualities, startAtSeconds = 0, onProgress }: VideoPlayerProps) {
  // Initial best server — hanya dihitung sekali saat mount / episode baru
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Key untuk force-remount iframe hanya saat episode benar-benar ganti (bukan saat quality overlay muncul)
  const [iframeKey, setIframeKey] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startTimeRef = useRef(Date.now());
  const accumulatedRef = useRef(startAtSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track episode slug agar tidak reload iframe saat qualities object reference berubah
  const loadedForUrl = useRef<string>("");

  // Progress tracking
  useEffect(() => {
    if (!onProgress || loading || error) return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      onProgress(Math.floor(accumulatedRef.current + (Date.now() - startTimeRef.current) / 1000));
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      accumulatedRef.current += (Date.now() - startTimeRef.current) / 1000;
    };
  }, [loading, error, onProgress]);

  // Load embed URL — hanya jalan kalau defaultUrl berubah (episode baru), bukan saat qualities re-render
  useEffect(() => {
    // Kalau defaultUrl sama dengan yang udah di-load, skip — ini cuma re-render biasa
    if (defaultUrl && loadedForUrl.current === defaultUrl) return;

    setLoading(true);
    setError(false);
    setEmbedUrl(null);
    accumulatedRef.current = startAtSeconds;

    const best = pickBestServer(qualities);
    async function load() {
      if (best?.serverId) {
        const url = await fetchEmbedUrl(best.serverId);
        if (url) {
          loadedForUrl.current = defaultUrl;
          setEmbedUrl(url);
          setIframeKey(k => k + 1);
          return;
        }
      }
      if (defaultUrl) {
        loadedForUrl.current = defaultUrl;
        setEmbedUrl(defaultUrl);
        setIframeKey(k => k + 1);
        return;
      }
      setError(true);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultUrl]);

  // Fullscreen landscape lock
  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (fsEl) lockLandscape(); else unlockOrientation();
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  const handleExpand = useCallback(() => {
    const target = iframeRef.current || wrapperRef.current;
    if (!target) return;
    if ((target as any).requestFullscreen) {
      (target as any).requestFullscreen().catch(() => {});
    } else if ((target as any).webkitRequestFullscreen) {
      (target as any).webkitRequestFullscreen();
    }
    setTimeout(lockLandscape, 100);
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
            key={iframeKey}
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-presentation allow-forms"
            title="Video Player"
            onLoad={() => setLoading(false)}
          />
          <button
            onClick={handleExpand}
            className="absolute bottom-2.5 right-2.5 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            title="Layar Penuh"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
