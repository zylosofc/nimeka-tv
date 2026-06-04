import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";

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
    const res = await fetch(`/trpc/anime.server?input=${encodeURIComponent(JSON.stringify({ serverId }))}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.result?.data?.url || json?.data?.url || null;
  } catch {
    return null;
  }
}

export default function VideoPlayer({ defaultUrl, qualities }: VideoPlayerProps) {
  const best = pickBestServer(qualities);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setEmbedUrl(null);

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
  }, [qualities, defaultUrl]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
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
          allowFullScreen
          allow="fullscreen; autoplay"
          sandbox="allow-same-origin allow-scripts allow-popups allow-presentation allow-forms"
          title="Video Player"
          onLoad={() => setLoading(false)}
        />
      )}
    </div>
  );
}
