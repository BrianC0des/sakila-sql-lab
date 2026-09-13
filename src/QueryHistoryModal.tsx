import React, { useState, useMemo } from "react";
import { X, Search, Clock, CheckCircle2, AlertCircle, Copy, Check, RotateCcw, Trash2 } from "lucide-react";

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  durationMs: number;
  rowCount: number;
  passed?: boolean;
  challengeTitle?: string;
}

interface QueryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: QueryHistoryItem[];
  onRestoreQuery: (query: string) => void;
  onClearHistory: () => void;
}

export const QueryHistoryModal: React.FC<QueryHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestoreQuery,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPassed, setFilterPassed] = useState<"all" | "passed" | "failed">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (filterPassed === "passed" && !item.passed) return false;
      if (filterPassed === "failed" && item.passed) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQuery = item.query.toLowerCase().includes(q);
        const matchTitle = (item.challengeTitle || "").toLowerCase().includes(q);
        if (!matchQuery && !matchTitle) return false;
      }
      return true;
    });
  }, [history, filterPassed, searchQuery]);

  const copyQuery = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-925 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>SQL Execution Run History</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {history.length} runs recorded
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Click "Restore to Editor" to recover any previously executed query
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 py-2.5 border-b border-slate-800 bg-slate-900/80 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SQL text or challenge name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setFilterPassed("all")}
                className={`px-2 py-0.5 rounded ${
                  filterPassed === "all"
                    ? "bg-slate-800 text-slate-200 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPassed("passed")}
                className={`px-2 py-0.5 rounded ${
                  filterPassed === "passed"
                    ? "bg-emerald-950 text-emerald-300 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Passed
              </button>
              <button
                onClick={() => setFilterPassed("failed")}
                className={`px-2 py-0.5 rounded ${
                  filterPassed === "failed"
                    ? "bg-rose-950 text-rose-300 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Failed
              </button>
            </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Clear all executed query history?")) {
                    onClearHistory();
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                title="Clear run history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              {history.length === 0
                ? "No queries executed yet. Run queries in the editor to build history."
                : "No queries match your search filter."}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 hover:border-slate-700 transition"
              >
                {/* Meta Row */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    {item.passed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Passed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Failed / Syntax</span>
                      </span>
                    )}

                    {item.challengeTitle && (
                      <span className="text-slate-400 max-w-xs truncate">
                        • {item.challengeTitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <span>{item.rowCount} rows</span>
                    <span>•</span>
                    <span>{item.durationMs.toFixed(1)}ms</span>
                    <span>•</span>
                    <span>{formatRelativeTime(item.timestamp)}</span>
                  </div>
                </div>

                {/* SQL Code Box */}
                <pre className="p-2.5 rounded bg-slate-925 border border-slate-850 text-xs font-mono text-sky-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {item.query}
                </pre>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => copyQuery(item.id, item.query)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-[11px] font-mono border border-slate-750 transition"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" /> Copy SQL
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onRestoreQuery(item.query);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-mono font-semibold transition shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore to Editor
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-925 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            History is automatically saved locally in your browser for this database.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
