import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  to?: string;
  showMore?: boolean;
  icon?: ReactNode;
}

export default function SectionTitle({ title, to, showMore = true, icon }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {showMore && to && (
        <Link
          to={to}
          className="flex items-center gap-0.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Lihat Semua
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
