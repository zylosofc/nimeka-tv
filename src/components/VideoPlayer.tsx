import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, ChevronDown, Check } from "lucide-react";

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
const BLOCKED_SERVERS = ["vidhide", "filedon", "mega", "streamlare", "mp4upload", "solidfiles"];

function isDirectStream(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase().split("?")[0];
  return u.endsWith(".mp4") || u.endsWith(".m3u8") || u.endsWith(".webm");
}

function isBlocked(title: string): boolean {
  const t = title.toLowerCase();
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

async function fetchBestForQuality(q: QualityServer): Promise<{ url: string; label: string } | null> {
  const allowed = q.serverList.filter(s => !isBlocked(s.title));
  if (!allowed.length) return null;
  const results = await Promise.allSettled(
    allowed.map(async s => {
      const url = await fetchStreamUrl(s.serverId);
      if (url && isDirectStream(url)) return { url, label: q.title };
      return null;
    })
  );
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
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState(false);
  const [activeQuality, setActiveQuality] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadedFor = useRef("");

  // Load awal — auto pilih quality tertinggi
  useEffect(() => {
    const key = defaultUrl + sorted.map(q => q.title).join(",");
    if (loadedFor.current === key) return;
    loadedFor.current = key;
    setLoading(true); setError(false); setStreamUrl(null); setActiveQuality("");

    async function load() {
      for (const q of sorted) {
        const result = await fetchBestForQuality(q);
        if (result) {
          setStreamUrl(result.url);
          setIsDirect(true);
          setActiveQuality(result.label);
          onQualityFound?.(result.label);
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

  // Ganti quality manual dari dropdown
  async function changeQuality(q: QualityServer) {
    if (q.title === activeQuality) { setShowDropdown(false); return; }
    setShowDropdown(false);
    setSwitching(true);
    const savedTime = videoRef.current?.currentTime || 0;
    const result = await fetchBestForQuality(q);
    if (result) {
      setStreamUrl(result.url);
      setIsDirect(true);
      setActiveQuality(result.label);
      onQualityFound?.(result.label);
      setTimeout(() => {
        if (videoRef.current && savedTime > 0) videoRef.current.currentTime = savedTime;
      }, 600);
    }
    setSwitching(false);
  }

  // Resume
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
    const close = () => setShowDropdown(false);
    setTimeout(() => document.addEventListener("click", close), 0);
    return () => document.removeEventListener("click", close);
  }, [showDropdown]);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: isDirect && streamUrl ? undefined : "16/9" }}>

      {/* Loading / Switching overlay */}
      {(loading || switching) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-2"
          style={{ minHeight: 210 }}>
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-xs text-gray-500">
            {switching ? `Mengganti ke ${activeQuality}...` : "Memuat video..."}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-2"
          style={{ minHeight: 210 }}>
          <AlertCircle className="w-8 h-8 text-red-400" />
          <span className="text-xs text-gray-500">Video tidak tersedia</span>
        </div>
      )}

      {/* Native video */}
      {streamUrl && isDirect && (
        <video ref={videoRef} src={streamUrl} controls playsInline
          className="w-full h-full"
          style={{ objectFit: "cover", background: "#000" }}
          onLoadedData={() => setLoading(false)}
          onError={() => setIsDirect(false)}
        />
      )}

      {/* Iframe fallback */}
      {streamUrl && !isDirect && (
        <iframe src={streamUrl} className="w-full h-full" style={{ minHeight: 210 }}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="no-referrer-when-downgrade"
          title="Video Player"
          onLoad={() => setLoading(false)}
        />
      )}

      {/* Quality dropdown — pojok kanan atas, hanya tampil kalau ada pilihan */}
      {!loading && !error && sorted.length > 1 && (
        <div className="absolute top-2 right-2 z-20" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowDropdown(d => !d)}
            className="flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/20"
          >
            {activeQuality || "Auto"}
            <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[90px]">
              {sorted.map(q => (
                <button key={q.title} onClick={() => changeQuality(q)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-white/10 transition-colors">
                  <span className={q.title === activeQuality ? "text-purple-400 font-bold" : "text-gray-200"}>
                    {q.title}
                  </span>
                  {q.title === activeQuality && <Check className="w-3 h-3 text-purple-400 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
