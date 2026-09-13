import React, { useState, useMemo, useRef, useEffect } from "react";
import { CheckCircle2, ChevronRight, BookOpen, Search, X, Hash, ChevronDown, Filter, Check } from "lucide-react";

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
  activeTags?: string[];
  onTagChange?: (tag: string) => void;
  onTagsChange?: (tags: string[]) => void;
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
  activeTags: activeTagsProp,
  onTagChange,
  onTagsChange,
}) => {
  const [internalFilter, setInternalFilter] = useState<string>("all");
  const [internalTags, setInternalTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Multi-select topic dropdown states
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");
  const [tagMatchMode, setTagMatchMode] = useState<"any" | "all">("any");
  const topicDropdownRef = useRef<HTMLDivElement>(null);

  // Close topic dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(e.target as Node)) {
        setIsTopicMenuOpen(false);
      }
    };
    if (isTopicMenuOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isTopicMenuOpen]);

  const activeFilter = activeFilterProp !== undefined ? activeFilterProp : internalFilter;

  // Derive normalized selected tags list
  const selectedTags = useMemo<string[]>(() => {
    if (activeTagsProp !== undefined) return activeTagsProp;
    if (activeTagProp !== undefined) {
      return activeTagProp === "all" || !activeTagProp ? [] : [activeTagProp.toLowerCase()];
    }
    return internalTags;
  }, [activeTagsProp, activeTagProp, internalTags]);

  const setActiveFilter = (filter: string) => {
    if (onFilterChange) {
      onFilterChange(filter);
    } else {
      setInternalFilter(filter);
    }
  };

  const updateSelectedTags = (newTags: string[]) => {
    const cleaned = Array.from(new Set(newTags.map((t) => t.toLowerCase())));
    if (onTagsChange) {
      onTagsChange(cleaned);
    }
    if (onTagChange) {
      onTagChange(cleaned.length === 1 ? cleaned[0] : cleaned.length === 0 ? "all" : cleaned[0]);
    }
    setInternalTags(cleaned);
  };

  const toggleTag = (tag: string) => {
    const clean = tag.toLowerCase();
    const next = selectedTags.includes(clean)
      ? selectedTags.filter((t) => t !== clean)
      : [...selectedTags, clean];
    updateSelectedTags(next);
  };

  const clearAllTags = () => {
    updateSelectedTags([]);
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

  // Derive unique tags with question frequencies
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    milestones.forEach((m) => {
      (m.tags || []).forEach((t) => {
        const clean = t.toLowerCase();
        counts.set(clean, (counts.get(clean) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [milestones]);

  // Filter tags based on topic search input
  const filteredTagCounts = useMemo(() => {
    if (!topicSearch.trim()) return tagCounts;
    const q = topicSearch.toLowerCase();
    return tagCounts.filter(({ tag }) => tag.includes(q));
  }, [tagCounts, topicSearch]);

  // Filtered view
  const filteredMilestones = useMemo(() => {
    return milestones
      .map((m, idx) => ({ m, idx }))
      .filter(({ m }) => {
        if (activeFilter !== "all") {
          const cat = (m.category ?? m.difficulty ?? "").toLowerCase();
          if (cat !== activeFilter.toLowerCase()) return false;
        }
        if (selectedTags.length > 0) {
          const mTags = (m.tags || []).map((t) => t.toLowerCase());
          const matches =
            tagMatchMode === "all"
              ? selectedTags.every((t) => mTags.includes(t))
              : selectedTags.some((t) => mTags.includes(t));
          if (!matches) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchTags = (m.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchTags) return false;
        }
        return true;
      });
  }, [milestones, activeFilter, selectedTags, tagMatchMode, searchQuery]);

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
              className="absolute right-1.5 top-1.5 p-0.5 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Controls (Difficulty & Multi-Select Topic Dropdowns) ── */}
      {(categories.length > 0 || tagCounts.length > 0) && (
        <div className="px-2.5 py-2 border-b border-slate-800/80 shrink-0 space-y-1.5 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
              <Filter className="w-2.5 h-2.5 text-sky-400" />
              Filter by
            </span>
            {(activeFilter !== "all" || selectedTags.length > 0 || searchQuery) && (
              <button
                onClick={() => {
                  setActiveFilter("all");
                  clearAllTags();
                  setSearchQuery("");
                }}
                className="text-[9px] text-sky-400 hover:text-sky-300 transition hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* Difficulty Dropdown */}
            {categories.length > 0 && (
              <div>
                <label
                  htmlFor="difficulty-filter-select"
                  className="block text-[9px] text-slate-400 mb-0.5 font-medium"
                >
                  Difficulty
                </label>
                <div className="relative">
                  <select
                    id="difficulty-filter-select"
                    data-test="difficulty-select"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="w-full text-[11px] bg-slate-950 border border-slate-800 rounded px-2 py-1 pr-5 text-slate-200 focus:outline-hidden focus:border-sky-500 font-sans cursor-pointer hover:border-slate-700 transition appearance-none truncate"
                  >
                    <option value="all">All ({milestones.length})</option>
                    {categories.map((cat) => {
                      const count = milestones.filter(
                        (m) => (m.category ?? m.difficulty ?? "").toLowerCase() === cat.toLowerCase()
                      ).length;
                      return (
                        <option key={cat} value={cat}>
                          {capitalise(cat)} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Multi-Select Topic Tag Dropdown */}
            {tagCounts.length > 0 && (
              <div ref={topicDropdownRef} className="relative">
                {/* Hidden select for backwards compatibility & automated test assertions */}
                <select
                  id="topic-filter-select"
                  data-test="topic-select"
                  value={selectedTags.length === 1 ? selectedTags[0] : selectedTags.length === 0 ? "all" : selectedTags[0]}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "all") clearAllTags();
                    else updateSelectedTags([val]);
                  }}
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <option value="all">All Topics</option>
                  {tagCounts.map(({ tag, count }) => (
                    <option key={tag} value={tag}>
                      #{tag} ({count})
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between mb-0.5">
                  <label
                    onClick={() => setIsTopicMenuOpen((prev) => !prev)}
                    className="block text-[9px] text-slate-400 font-medium cursor-pointer"
                  >
                    Topic Tags
                  </label>
                  {selectedTags.length > 0 && (
                    <span className="text-[9px] text-sky-400 font-mono font-semibold">
                      {selectedTags.length} active
                    </span>
                  )}
                </div>

                {/* Multi-Select Trigger Button */}
                <button
                  type="button"
                  data-test="topic-multiselect-trigger"
                  onClick={() => setIsTopicMenuOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between text-[11px] bg-slate-950 border rounded px-2 py-1 text-slate-200 font-sans cursor-pointer transition truncate ${
                    isTopicMenuOpen || selectedTags.length > 0
                      ? "border-sky-500/80 bg-slate-950"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                  title={
                    selectedTags.length === 0
                      ? "All Topics (Click to select multiple tags)"
                      : selectedTags.map((t) => `#${t}`).join(", ")
                  }
                >
                  <span className="truncate">
                    {selectedTags.length === 0
                      ? "All Topics"
                      : selectedTags.length === 1
                      ? `#${selectedTags[0]}`
                      : `${selectedTags.length} tags selected`}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform ${
                        isTopicMenuOpen ? "rotate-180 text-sky-400" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Floating Multi-Select Popover Menu */}
                {isTopicMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 max-h-72 flex flex-col bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    {/* Search inside tags */}
                    <div className="relative mb-2">
                      <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2 pointer-events-none" />
                      <input
                        type="text"
                        value={topicSearch}
                        onChange={(e) => setTopicSearch(e.target.value)}
                        placeholder={`Search ${tagCounts.length} tags...`}
                        className="w-full pl-7 pr-6 py-1 text-[11px] bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500 font-sans"
                        autoFocus
                      />
                      {topicSearch && (
                        <button
                          type="button"
                          onClick={() => setTopicSearch("")}
                          className="absolute right-1.5 top-1.5 p-0.5 text-slate-500 hover:text-slate-300"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Mode & Action Header */}
                    <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-800 mb-1.5 text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Match:</span>
                        <button
                          type="button"
                          onClick={() => setTagMatchMode("any")}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                            tagMatchMode === "any"
                              ? "bg-sky-950 text-sky-300 border border-sky-700"
                              : "text-slate-500 hover:text-slate-300 border border-transparent"
                          }`}
                          title="Show questions matching ANY selected tag (OR)"
                        >
                          ANY
                        </button>
                        <button
                          type="button"
                          onClick={() => setTagMatchMode("all")}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                            tagMatchMode === "all"
                              ? "bg-sky-950 text-sky-300 border border-sky-700"
                              : "text-slate-500 hover:text-slate-300 border border-transparent"
                          }`}
                          title="Show questions matching ALL selected tags (AND)"
                        >
                          ALL
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedTags.length > 0 && (
                          <button
                            type="button"
                            onClick={clearAllTags}
                            className="text-[10px] text-rose-400 hover:text-rose-300 transition cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsTopicMenuOpen(false)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 transition font-semibold cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Tag Checkbox List */}
                    <div className="overflow-y-auto space-y-0.5 flex-1 max-h-48 pr-0.5">
                      {filteredTagCounts.length === 0 ? (
                        <div className="text-center py-3 text-[11px] text-slate-500 italic">
                          No matching tags
                        </div>
                      ) : (
                        filteredTagCounts.map(({ tag, count }) => {
                          const isSelected = selectedTags.includes(tag.toLowerCase());
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] font-mono transition text-left cursor-pointer ${
                                isSelected
                                  ? "bg-sky-950/80 text-sky-200 border border-sky-700/60 font-semibold"
                                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                                    isSelected
                                      ? "bg-sky-500 border-sky-400 text-slate-950"
                                      : "border-slate-700 bg-slate-950"
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </span>
                                <span className="truncate">#{tag}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 font-sans ml-2">
                                {count}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Filter Badges */}
          {(activeFilter !== "all" || selectedTags.length > 0) && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  title="Remove difficulty filter"
                  className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/80 hover:bg-sky-900 transition cursor-pointer"
                >
                  <span>{capitalise(activeFilter)}</span>
                  <X className="w-2.5 h-2.5 text-sky-400" />
                </button>
              )}
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  title={`Remove #${tag} filter`}
                  className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/80 hover:bg-purple-900 transition cursor-pointer"
                >
                  <span>#{tag}</span>
                  <X className="w-2.5 h-2.5 text-purple-400" />
                </button>
              ))}
              {selectedTags.length > 1 && (
                <button
                  onClick={clearAllTags}
                  className="text-[9px] text-slate-400 hover:text-slate-200 transition underline ml-0.5 cursor-pointer"
                >
                  Clear all ({selectedTags.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Milestone List ── */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-1 min-h-0">
        <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {activeFilter === "all" && selectedTags.length === 0
            ? "Course Milestones"
            : `Filtered · ${filteredMilestones.length} shown`}
        </div>

        {filteredMilestones.length === 0 ? (
          <div className="px-3 py-4 text-[11px] text-slate-500 text-center italic">
            No milestones match your current filters.
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
                        {m.tags.slice(0, 3).map((t) => {
                          const isTagActive = selectedTags.includes(t.toLowerCase());
                          return (
                            <span
                              key={t}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTag(t);
                              }}
                              className={`text-[9px] font-mono px-1 py-0.2 rounded transition cursor-pointer shrink-0 ${
                                isTagActive
                                  ? "bg-purple-900 text-purple-200 border border-purple-600 font-semibold"
                                  : "bg-slate-800 text-slate-400 hover:text-purple-300 hover:bg-slate-750"
                              }`}
                              title={`Click to ${isTagActive ? "remove" : "filter by"} #${t}`}
                            >
                              #{t}
                            </span>
                          );
                        })}
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
          Source Repository
        </div>
        <a
          href={githubUrl || "https://github.com/BrianC0des/sakila-sql-lab"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 hover:border-sky-500/60 text-slate-300 hover:text-sky-300 transition text-[11px] group"
        >
          <div className="flex items-center gap-2">
            <GithubIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 transition" />
            <span className="font-mono text-[10px]">sakila-sql-lab</span>
          </div>
          <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-sans">
            v1.0 ↗
          </span>
        </a>
      </div>
    </nav>
  );
};
