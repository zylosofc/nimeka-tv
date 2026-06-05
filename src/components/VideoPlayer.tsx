import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface ServerItem { title: string; serverId: string; href: string; }
interface QualityServer { title: string; serverList: ServerItem[]; }
interface VideoPlayerProps {
  defaultUrl: string;
  qualities: QualityServer[];
  resumeTime?: number;
  onTimeUpdate?: (time: number) => void;
  onQualityFound?: (label: string) => void;
}

const QUALITY_ORDER = ["1080p", "720p", "480p", "360p", "HD", "SD"];

// Server yang diketahui redirect/open new tab — skip
const BLOCKED_SERVERS = ["otakudesu", "vidhide", "filedon", "mega", "streamlare", "mp4upload"];

function isDirectStream(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase().split("?")[0];
  return u.endsWith(".mp4") || u.endsWith(".m3u8") || u.endsWith(".webm");
}

function isBlockedServer(serverTitle: string): boolean {
  const t = serverTitle.toLowerCase();
  return BLOCKED_SERVERS.some(b => t.includes(b));
}

function sortQualities(qualities: QualityServer[]): QualityServer[] {
  return [...qualities].sort((a, b) => {
    const ai = QUALITY_ORDER.indexOf(a.title), bi = QUALITY_ORDER.indexOf(b.title);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });
}

async function fetchStreamUrl(serverId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/trpc/anime.server?input=${encodeURIComponent(JSON.stringify({ json: { serverId } }))}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.result?.data?.json?.url || json?.result?.data?.url || json?.data?.url || null;
  } catch { return null; }
}

// Fetch semua server non-blocked dari 1 quality secara parallel
async function fetchBestForQuality(q: QualityServer): Promise<{ url: string; label: string } | null> {
  const allowed = q.serverList.filter(s => !isBlockedServer(s.title));
  if (!allowed.length) return null;

  const results = await Promise.allSettled(
    allowed.map(async s => {
      const url = await fetchStreamUrl(s.serverId);
      if (url && isDirectStream(url)) return { url, label: q.title, server: s.title };
      return null;
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      console.log(`✅ ${r.value.label} / ${r.value.server}:`, r.value.url.slice(0, 80));
      return r.value;
    }
  }
  return null;
}

export default function VideoPlayer({ defaultUrl, qualities, resumeTime, onTimeUpdate, onQualityFound }: VideoPlayerProps) {
  const sorted = sortQualities(qualities || []);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isDirect, setIsDirect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadedFor = useRef<string>("");

  useEffect(() => {
    const key = defaultUrl + sorted.map(q => q.title).join(",");
    if (loadedFor.current === key) return;
    loadedFor.current = key;
    setLoading(true); setError(false); setStreamUrl(null);

    async function load() {
      // Coba tiap quality dari tertinggi, parallel per quality
      for (const q of sorted) {
        const result = await fetchBestForQuality(q);
        if (result) {
          setStreamUrl(result.url);
          setIsDirect(true);
          onQualityFound?.(result.label);
          setLoading(false);
          return;
        }
      }
      // Fallback: defaultUrl (iframe)
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

  useEffect(() => {
    if (videoRef.current && resumeTime && resumeTime > 5) {
      videoRef.current.currentTime = resumeTime;
    }
  }, [streamUrl, resumeTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onTimeUpdate) return;
    const handler = () => onTimeUpdate(video.currentTime);
    video.addEventListener("timeupdate", handler);
    return () => video.removeEventListener("timeupdate", handler);
  }, [streamUrl, onTimeUpdate]);

  return (
    <div ref={wrapperRef}
      className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: isDirect ? undefined : "16/9" }}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-2" style={{ aspectRatio: "16/9" }}>
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-xs text-gray-500">Memuat video...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-2" style={{ aspectRatio: "16/9" }}>
          <AlertCircle className="w-8 h-8 text-red-400" />
          <span className="text-xs text-gray-500">Video tidak tersedia</span>
        </div>
      )}
      {streamUrl && isDirect && (
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          playsInline
          className="w-full h-full"
          style={{ objectFit: "cover", background: "#000" }}
          onLoadedData={() => setLoading(false)}
          onError={() => { setIsDirect(false); }}
        />
      )}
      {streamUrl && !isDirect && (
        <iframe
          src={streamUrl}
          className="w-full h-full"
          style={{ minHeight: 210 }}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="no-referrer-when-downgrade"
          title="Video Player"
          onLoad={() => setLoading(false)}
        />
      )}
    </div>
  );
}

interface ServerItem { title: string; serverId: string; href: string; }
interface QualityServer { title: string; serverList: ServerItem[]; }
interface VideoPlayerProps {
  defaultUrl: string;
  qualities: QualityServer[];
  resumeTime?: number;
  onTimeUpdate?: (time: number) => void;
  onQualityFound?: (label: string) => void;
}

const QUALITY_ORDER = ["1080p", "720p", "480p", "360p", "HD", "SD"];

function isDirectStream(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase().split("?")[0];
  return u.endsWith(".mp4") || u.endsWith(".m3u8") || u.endsWith(".webm") || u.endsWith(".mkv");
}

function sortQualities(qualities: QualityServer[]): QualityServer[] {
  return [...qualities].sort((a, b) => {
    const ai = QUALITY_ORDER.indexOf(a.title), bi = QUALITY_ORDER.indexOf(b.title);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });
}

async function fetchStreamUrl(serverId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/trpc/anime.server?input=${encodeURIComponent(JSON.stringify({ json: { serverId } }))}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.result?.data?.json?.url || json?.result?.data?.url || json?.data?.url || null;
  } catch { return null; }
}

// Fetch semua server dari 1 quality secara parallel, return yg pertama direct stream
async function fetchBestForQuality(q: QualityServer): Promise<string | null> {
  const results = await Promise.allSettled(
    q.serverList.map(s => fetchStreamUrl(s.serverId))
  );
  for (const r of results) {
    if (r.status === "fulfilled" && r.value && isDirectStream(r.value)) return r.value;
  }
  // Fallback: ambil URL apapun (embed)
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) return r.value;
  }
  return null;
}

export default function VideoPlayer({ defaultUrl, qualities, resumeTime, onTimeUpdate, onQualityFound }: VideoPlayerProps) {
  const sorted = sortQualities(qualities || []);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isDirect, setIsDirect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeQuality, setActiveQuality] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [changingQuality, setChangingQuality] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadedFor = useRef<string>("");

  // Load stream awal — pilih quality tertinggi yang ada direct stream
  useEffect(() => {
    const key = defaultUrl + sorted.map(q => q.title).join(",");
    if (loadedFor.current === key) return;
    loadedFor.current = key;
    setLoading(true); setError(false); setStreamUrl(null); setActiveQuality("");

    async function load() {
      for (const q of sorted) {
        const url = await fetchBestForQuality(q);
        if (url) {
          setStreamUrl(url);
          setIsDirect(isDirectStream(url));
          setActiveQuality(q.title);
          onQualityFound?.(q.title);
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

  // Ganti quality manual
  const changeQuality = useCallback(async (q: QualityServer) => {
    if (q.title === activeQuality) { setShowDropdown(false); return; }
    setShowDropdown(false);
    setChangingQuality(true);
    const savedTime = videoRef.current?.currentTime || 0;
    const url = await fetchBestForQuality(q);
    if (url) {
      setStreamUrl(url);
      setIsDirect(isDirectStream(url));
      setActiveQuality(q.title);
      onQualityFound?.(q.title);
      // Resume time setelah video load
      setTimeout(() => {
        if (videoRef.current && savedTime > 0) videoRef.current.currentTime = savedTime;
      }, 500);
    }
    setChangingQuality(false);
  }, [activeQuality, onQualityFound]);

  // Resume time
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

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = () => setShowDropdown(false);
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [showDropdown]);

  return (
    <div ref={wrapperRef} className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: isDirect ? undefined : "16/9" }}>

      {/* Loading */}
      {(loading || changingQuality) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-2">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-xs text-gray-500">
            {changingQuality ? `Mengganti ke ${activeQuality}...` : "Memuat video..."}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <span className="text-xs text-gray-500">Video tidak tersedia</span>
        </div>
      )}

      {/* Native video */}
      {streamUrl && isDirect && (
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          playsInline
          className="w-full h-full"
          style={{ objectFit: "cover", background: "#000" }}
          onLoadedData={() => setLoading(false)}
          onError={() => setIsDirect(false)}
        />
      )}

      {/* Iframe fallback */}
      {streamUrl && !isDirect && (
        <iframe
          src={streamUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="no-referrer-when-downgrade"
          title="Video Player"
          onLoad={() => setLoading(false)}
        />
      )}

      {/* Quality dropdown — pojok kanan atas, muncul saat video ready */}
      {!loading && !error && sorted.length > 1 && (
        <div className="absolute top-2 right-2 z-20" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowDropdown(d => !d)}
            className="flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded-lg border border-white/20 hover:bg-black/90 transition-colors"
          >
            {activeQuality || "Auto"}
            <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[100px]">
              {sorted.map(q => (
                <button
                  key={q.title}
                  onClick={() => changeQuality(q)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-white/10 transition-colors text-left"
                >
                  <span className={q.title === activeQuality ? "text-purple-400 font-bold" : "text-gray-200"}>
                    {q.title}
                  </span>
                  {q.title === activeQuality && <Check className="w-3 h-3 text-purple-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
