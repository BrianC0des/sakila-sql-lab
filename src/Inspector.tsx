import React, { useState, useMemo } from "react";
import { Search, Table, Cpu, X, Key, Layers, Clock, Database, Maximize2, Minimize2 } from "lucide-react";

export interface SchemaColumnDetail {
  name: string;
  type?: string;
  isPk?: boolean;
  notNull?: boolean;
}

export interface SchemaTableItem {
  name: string;
  columns: string[];
  columnDetails?: SchemaColumnDetail[];
}

interface InspectorProps {
  executionMs: number;
  rowCount: number;
  explainPlan?: { id: number; parent: number; notused: number; detail: string }[];
  schemaTables?: SchemaTableItem[];
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onClose?: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  executionMs,
  rowCount,
  explainPlan = [],
  schemaTables = [],
  isMaximized = false,
  onToggleMaximize,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"schema" | "explain">("schema");
  const [searchFilter, setSearchFilter] = useState("");

  // Total columns calculation
  const totalColumns = useMemo(() => {
    return schemaTables.reduce((acc, t) => acc + t.columns.length, 0);
  }, [schemaTables]);

  // Filtered schema tables based on search query
  const filteredTables = useMemo(() => {
    if (!searchFilter.trim()) return schemaTables;
    const q = searchFilter.toLowerCase();
    return schemaTables
      .map((t) => {
        const tableNameMatch = t.name.toLowerCase().includes(q);
        const matchedCols = t.columns.filter((c) => c.toLowerCase().includes(q));
        if (tableNameMatch || matchedCols.length > 0) {
          return {
            ...t,
            highlightCols: matchedCols,
          };
        }
        return null;
      })
      .filter((t): t is (SchemaTableItem & { highlightCols?: string[] }) => t !== null);
  }, [schemaTables, searchFilter]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs font-mono select-none">
      {/* ── Top Header & Tab Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
        {/* Left: Tab Switchers */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("schema")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === "schema"
                ? "bg-slate-800 text-emerald-300 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span>Schema Tables & Fields</span>
            <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-emerald-400 font-mono border border-emerald-500/30">
              {schemaTables.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("explain")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === "explain"
                ? "bg-slate-800 text-sky-300 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Execution Plan (EXPLAIN)</span>
            {explainPlan.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-sky-400 font-mono border border-sky-500/30">
                {explainPlan.length} steps
              </span>
            )}
          </button>
        </div>

        {/* Right: Search & Execution Metrics & Close Button */}
        <div className="flex items-center gap-3 ml-auto">
          {activeTab === "schema" ? (
            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2 pointer-events-none" />
              <input
                type="text"
                data-test="inspector-search"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Search ${schemaTables.length} tables or ${totalColumns} columns...`}
                className="pl-7 pr-6 py-1 w-48 sm:w-64 text-[11px] rounded bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-sans"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="absolute right-1.5 top-1.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Time: <strong className="text-emerald-400">{executionMs.toFixed(2)} ms</strong>
              </span>
              <span>
                Rows: <strong className="text-sky-400">{rowCount}</strong>
              </span>
              <span className="hidden md:inline text-slate-500">Engine: SQLite WASM</span>
            </div>
          )}

          {onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              title={isMaximized ? "Restore Inspector Height" : "Maximize Inspector Height"}
              aria-label={isMaximized ? "Restore Inspector Height" : "Maximize Inspector Height"}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close Inspector"
              aria-label="Close Inspector"
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Content Body ── */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0 bg-slate-900/60">
        {/* TAB 1: SCHEMA TABLES & FIELDS (FULL WIDTH) */}
        {activeTab === "schema" && (
          <div>
            {filteredTables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Database className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs">No tables or columns match "{searchFilter}".</p>
                <button
                  onClick={() => setSearchFilter("")}
                  className="mt-2 text-xs text-sky-400 hover:underline cursor-pointer"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredTables.map((table) => {
                  const details = table.columnDetails;
                  return (
                    <div
                      key={table.name}
                      className="flex flex-col rounded-lg bg-slate-950 border border-slate-800 shadow-sm overflow-hidden hover:border-slate-700 transition"
                    >
                      {/* Table Header */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800/80 shrink-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Table className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-bold text-slate-100 truncate text-[12px]">
                            {table.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-mono shrink-0">
                          {table.columns.length} cols
                        </span>
                      </div>

                      {/* Columns List */}
                      <div className="p-2 space-y-1 overflow-y-auto max-h-56 select-text">
                        {details && details.length > 0 ? (
                          details.map((col) => (
                            <div
                              key={col.name}
                              className="flex items-center justify-between text-[11px] py-1 px-1.5 rounded hover:bg-slate-900/80 transition"
                            >
                              <div className="flex items-center gap-1 min-w-0 pr-1">
                                {col.isPk && (
                                  <span
                                    title="Primary Key"
                                    className="flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0"
                                  >
                                    <Key className="w-2.5 h-2.5" />
                                    PK
                                  </span>
                                )}
                                <span className="font-mono text-slate-200 truncate" title={col.name}>
                                  {col.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-sky-400/80 bg-slate-900 px-1 rounded border border-slate-800 shrink-0">
                                {col.type || "ANY"}
                              </span>
                            </div>
                          ))
                        ) : (
                          // Fallback when columnDetails not provided
                          table.columns.map((col) => (
                            <div
                              key={col}
                              className="flex items-center justify-between text-[11px] py-0.5 px-1 rounded hover:bg-slate-900"
                            >
                              <span className="font-mono text-slate-300 truncate">{col}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXECUTION PLAN (EXPLAIN) (FULL WIDTH) */}
        {activeTab === "explain" && (
          <div className="max-w-4xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                SQLite Query Optimizer Execution Plan
              </span>
              <span className="text-[11px] text-slate-500">Generated via EXPLAIN QUERY PLAN</span>
            </div>

            {explainPlan.length === 0 ? (
              <div className="p-6 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold text-xs">No execution plan recorded yet</p>
                <p className="text-slate-500 text-[11px] max-w-md mx-auto">
                  Run any SQL query (e.g. SELECT, JOIN, GROUP BY) to inspect how SQLite indexes,
                  b-trees, and scan loops optimize execution.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-slate-950 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-2 px-3 py-1.5 bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="col-span-1">ID</span>
                  <span className="col-span-1">Parent</span>
                  <span className="col-span-10">Operation & Index Details</span>
                </div>
                {explainPlan.map((plan, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] hover:bg-slate-900/50 transition font-mono items-center"
                  >
                    <span className="col-span-1 text-slate-500">[{plan.id}]</span>
                    <span className="col-span-1 text-slate-600">{plan.parent}</span>
                    <span className="col-span-10 text-sky-300 font-sans text-xs">
                      {plan.detail}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
