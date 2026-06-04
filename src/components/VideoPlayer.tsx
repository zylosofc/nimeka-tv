import { useState, useEffect, useRef } from "react";
import { Download, ChevronDown, Loader2 } from "lucide-react";

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
  downloadQualities: {
    title: string;
    size: string;
    urls: { title: string; url: string }[];
  }[];
}

// Priority: highest resolution first
const QUALITY_ORDER = ["1080p", "720p", "480p", "360p", "SD", "HD"];

// Preferred server name (case-insensitive match)
const PREFERRED_SERVER = "otakudesuhd";

function pickBestUrl(qualities: QualityServer[]): { url: string; qualityLabel: string; serverLabel: string } | null {
  if (!qualities || qualities.length === 0) return null;

  // Sort qualities by priority
  const sorted = [...qualities].sort((a, b) => {
    const ai = QUALITY_ORDER.indexOf(a.title);
    const bi = QUALITY_ORDER.indexOf(b.title);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // For each quality (highest first), try to find preferred server
  for (const q of sorted) {
    const preferred = q.serverList.find(
      (s) => s.title.toLowerCase().includes(PREFERRED_SERVER)
    );
    if (preferred) {
      return {
        url: `https://www.sankavollerei.com/anime/server/${preferred.serverId}`,
        qualityLabel: q.title,
        serverLabel: preferred.title,
      };
    }
  }

  // Fallback: just take the first server of highest quality
  const first = sorted[0];
  if (first?.serverList?.[0]) {
    return {
      url: `https://www.sankavollerei.com/anime/server/${first.serverList[0].serverId}`,
      qualityLabel: first.title,
      serverLabel: first.serverList[0].title,
    };
  }

  return null;
}

export default function VideoPlayer({ defaultUrl, qualities, downloadQualities }: VideoPlayerProps) {
  const best = pickBestUrl(qualities);
  const [videoUrl, setVideoUrl] = useState(best?.url || defaultUrl);
  const [showDownloads, setShowDownloads] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const newBest = pickBestUrl(qualities);
    if (newBest) setVideoUrl(newBest.url);
    else if (defaultUrl) setVideoUrl(defaultUrl);
    setLoading(true);
  }, [qualities, defaultUrl]);

  return (
    <div className="space-y-3">
      {/* Video iframe */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="w-full h-full"
          allowFullScreen
          allow="fullscreen; autoplay"
          sandbox="allow-same-origin allow-scripts allow-popups allow-presentation allow-forms"
          title="Video Player"
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* Auto-selected info badge */}
      {best && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] text-gray-500">Otomatis:</span>
          <span className="text-[11px] px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded-md font-medium border border-purple-500/20">
            {best.qualityLabel}
          </span>
          <span className="text-[11px] px-2 py-0.5 bg-white/5 text-gray-400 rounded-md border border-white/10">
            {best.serverLabel}
          </span>
        </div>
      )}

      {/* Download Section */}
      {downloadQualities.length > 0 && (
        <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowDownloads(!showDownloads)}
            className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-200">Link Download</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDownloads ? "rotate-180" : ""}`}
            />
          </button>

          {showDownloads && (
            <div className="px-4 pb-4 space-y-3">
              {downloadQualities.map((dq) => (
                <div key={dq.title}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-purple-400">{dq.title}</span>
                    <span className="text-[10px] text-gray-500">({dq.size})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dq.urls.map((u) => (
                      <a
                        key={u.title}
                        href={u.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                      >
                        {u.title}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
