import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function LoadingSpinner({ size = "md", text = "Memuat..." }: LoadingSpinnerProps) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className={`${sizes[size]} text-purple-500 animate-spin`} />
      <span className="text-sm text-gray-400">{text}</span>
    </div>
  );
}

export function SkeletonCard({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[140px] sm:w-[160px] flex-shrink-0 animate-pulse">
          <div className="aspect-[3/4] rounded-xl bg-gray-800" />
          <div className="mt-2 h-4 bg-gray-800 rounded w-3/4" />
          <div className="mt-1 h-3 bg-gray-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-xl bg-gray-800" />
          <div className="mt-2 h-4 bg-gray-800 rounded w-3/4" />
          <div className="mt-1 h-3 bg-gray-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
