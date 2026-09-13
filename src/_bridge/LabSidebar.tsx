import React, { useState, useMemo } from "react";
import { CheckCircle2, ChevronRight, BookOpen, Search, X, Hash } from "lucide-react";

export const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export interface LabMilestone {
  id: string;
  title: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
}

export interface LabSidebarProps {
  title: string;
  subtitle?: string;
  milestones: LabMilestone[];
  currentIndex: number;
  completedIds?: string[];
  onSelect: (index: number) => void;
  className?: string;
  githubUrl?: string;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  activeTag?: string;
  onTagChange?: (tag: string) => void;
}

// Colour tokens per difficulty category
const CATEGORY_STYLES: Record<string, { pill: string; badge: string }> = {
  beginner:     { pill: "bg-emerald-900/60 text-emerald-300 border-emerald-700 hover:bg-emerald-800/60", badge: "text-emerald-400" },
  intermediate: { pill: "bg-amber-900/50 text-amber-300 border-amber-700 hover:bg-amber-800/50",         badge: "text-amber-400"   },
  advanced:     { pill: "bg-rose-900/50 text-rose-300 border-rose-700 hover:bg-rose-800/50",             badge: "text-rose-400"    },
  custom:       { pill: "bg-purple-900/50 text-purple-300 border-purple-700 hover:bg-purple-800/50",     badge: "text-purple-400"  },
};
const ACTIVE_PILL = "ring-2 ring-offset-1 ring-offset-slate-900 brightness-125";
const DEFAULT_PILL = "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200";

export const LabSidebar: React.FC<LabSidebarProps> = ({
  title,
  subtitle = "Tutorial Navigation",
  milestones,
  currentIndex,
  completedIds = [],
  onSelect,
  className = "",
  githubUrl,
  activeFilter: activeFilterProp,
  onFilterChange,
  activeTag: activeTagProp,
  onTagChange,
}) => {
  const [internalFilter, setInternalFilter] = useState<string>("all");
  const [internalTag, setInternalTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeFilter = activeFilterProp !== undefined ? activeFilterProp : internalFilter;
  const activeTag = activeTagProp !== undefined ? activeTagProp : internalTag;

  const setActiveFilter = (filter: string) => {
    if (onFilterChange) {
      onFilterChange(filter);
    } else {
      setInternalFilter(filter);
    }
  };

  const setActiveTag = (tag: string) => {
    if (onTagChange) {
      onTagChange(tag);
    } else {
      setInternalTag(tag);
    }
  };

  const completedCount = completedIds.length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Derive unique categories present in this milestone set
  const categories = useMemo(() => {
    const seen = new Set<string>();
    milestones.forEach((m) => {
      const cat = (m.category ?? m.difficulty ?? "").toLowerCase();
      if (cat) seen.add(cat);
    });
    return Array.from(seen);
  }, [milestones]);

  // Derive top unique tags across milestones
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    milestones.forEach((m) => {
      (m.tags || []).forEach((t) => {
        const clean = t.toLowerCase();
        counts.set(clean, (counts.get(clean) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [milestones]);

  // Filtered view
  const filteredMilestones = useMemo(() => {
    return milestones
      .map((m, idx) => ({ m, idx }))
      .filter(({ m }) => {
        if (activeFilter !== "all") {
          const cat = (m.category ?? m.difficulty ?? "").toLowerCase();
          if (cat !== activeFilter.toLowerCase()) return false;
        }
        if (activeTag && activeTag !== "all") {
          const tags = (m.tags || []).map((t) => t.toLowerCase());
          if (!tags.includes(activeTag.toLowerCase())) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchTags = (m.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchTags) return false;
        }
        return true;
      });
  }, [milestones, activeFilter, activeTag, searchQuery]);

  const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <nav
      aria-label="Tutorial Milestones Navigation"
      className={`flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 select-none ${className}`}
    >
      {/* ── Sidebar Header ── */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-925/80 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 truncate">
            {title}
          </h2>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2">
          <span>{subtitle}</span>
          <span className="text-sky-400 font-semibold">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Mini Progress Track */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="px-2.5 pt-2.5 pb-1.5 border-b border-slate-800/80 shrink-0">
        <div className="relative">
          <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or tags..."
            className="w-full pl-7 pr-6 py-1 text-[11px] rounded bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500 font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-1.5 top-1.5 p-0.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Difficulty Filter Pills ── */}
      {categories.length > 0 && (
        <div className="px-2.5 py-1.5 border-b border-slate-800/80 shrink-0">
          <div className="text-[9px] font-bold tracking-wider text-slate-500 uppercase mb-1">
            Filter by difficulty
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={`text-[10px] px-2 py-0.5 rounded border font-medium transition ${
                activeFilter === "all"
                  ? `${DEFAULT_PILL} ${ACTIVE_PILL} ring-sky-500 text-sky-300 border-sky-600`
                  : DEFAULT_PILL
              }`}
            >
              All
            </button>

            {categories.map((cat) => {
              const styles = CATEGORY_STYLES[cat] ?? DEFAULT_PILL;
              const isActive = activeFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(isActive ? "all" : cat)}
                  className={`text-[10px] px-2 py-0.5 rounded border font-medium transition ${styles.pill} ${
                    isActive ? ACTIVE_PILL + " ring-current" : ""
                  }`}
                >
                  {capitalise(cat)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Topic Tag Filter Pills ── */}
      {allTags.length > 0 && (
        <div className="px-2.5 py-1.5 border-b border-slate-800/80 shrink-0 overflow-x-auto">
          <div className="text-[9px] font-bold tracking-wider text-slate-500 uppercase mb-1">
            Filter by topic
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setActiveTag("all")}
              className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 font-mono transition ${
                activeTag === "all"
                  ? "bg-sky-950 text-sky-300 border border-sky-600 font-semibold"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-750"
              }`}
            >
              All Topics
            </button>
            {allTags.slice(0, 10).map((tag) => {
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(isActive ? "all" : tag)}
                  className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 font-mono transition flex items-center gap-0.5 ${
                    isActive
                      ? "bg-sky-900 text-sky-200 border border-sky-500 font-semibold shadow-xs"
                      : "bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-750"
                  }`}
                >
                  <span>#{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Milestone List ── */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-1 min-h-0">
        <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {activeFilter === "all" ? "Course Milestones" : `${capitalise(activeFilter)} · ${filteredMilestones.length} shown`}
        </div>

        {filteredMilestones.length === 0 ? (
          <div className="px-3 py-4 text-[11px] text-slate-500 text-center italic">
            No milestones in this category yet.
          </div>
        ) : (
          filteredMilestones.map(({ m, idx }) => {
            const isSelected = idx === currentIndex;
            const isCompleted = completedIds.includes(m.id);
            const cat = (m.category ?? m.difficulty ?? "").toLowerCase();
            const catStyle = CATEGORY_STYLES[cat];

            // Split "Milestone X: Title" into clean title
            const displayTitle = m.title.includes(":")
              ? m.title.split(":")[1].trim()
              : m.title;

            return (
              <button
                key={m.id}
                onClick={() => onSelect(idx)}
                className={`w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-md text-xs transition group ${
                  isSelected
                    ? "bg-sky-950/70 text-sky-200 border-l-2 border-sky-400 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-l-2 border-transparent"
                }`}
              >
                {/* Status Badge / Number */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                        isSelected
                          ? "border-sky-400/80 bg-sky-900/60 text-sky-300 font-bold"
                          : "border-slate-700 bg-slate-850 text-slate-500 group-hover:border-slate-600 group-hover:text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="truncate leading-tight">{displayTitle}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {cat && (
                      <span
                        className={`text-[10px] font-mono uppercase truncate ${
                          catStyle?.badge ?? "text-slate-500"
                        } group-hover:opacity-90`}
                      >
                        {cat}
                      </span>
                    )}
                    {m.tags && m.tags.length > 0 && (
                      <div className="flex items-center gap-1 overflow-hidden">
                        {m.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 group-hover:text-slate-300 shrink-0"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active chevron */}
                {isSelected && (
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 self-center" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* ── GitHub Source Code Footer ── */}
      <div className="shrink-0 border-t border-slate-800 px-3 py-2.5">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          Source Code
        </div>
        <a
          href={githubUrl ?? "https://github.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-slate-100 transition group"
        >
          <GithubIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 shrink-0" />
          <span className="truncate font-mono">
            {githubUrl
              ? githubUrl.replace("https://github.com/", "")
              : "View on GitHub"}
          </span>
        </a>
      </div>
    </nav>
  );
};
