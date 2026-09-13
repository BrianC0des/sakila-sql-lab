import React, { useState, useMemo } from "react";
import { X, Search, Key, Link2, Copy, Check, Database, GitFork, ArrowRight } from "lucide-react";
import type { Database as SqlJsDatabase } from "sql.js";

interface ErdModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: SqlJsDatabase | null;
  activeDbName: string;
  onInsertSnippet?: (snippet: string) => void;
}

interface ColumnInfo {
  name: string;
  type: string;
  isPk: boolean;
  fkTarget?: { table: string; column: string };
}

interface TableSchema {
  name: string;
  columns: ColumnInfo[];
}

export const ErdModal: React.FC<ErdModalProps> = ({
  isOpen,
  onClose,
  db,
  activeDbName,
  onInsertSnippet,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Dynamic schema introspection from SQLite database
  const tables = useMemo<TableSchema[]>(() => {
    if (!db) return [];
    try {
      // 1. Get list of user tables
      const tablesRes = db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;"
      );
      if (tablesRes.length === 0) return [];

      const tableNames: string[] = tablesRes[0].values.map((v) => String(v[0]));

      return tableNames.map((tableName) => {
        // 2. Introspect columns & PKs
        const colsRes = db.exec(`PRAGMA table_info("${tableName}");`);
        const colList: ColumnInfo[] = [];
        if (colsRes.length > 0) {
          colsRes[0].values.forEach((v) => {
            colList.push({
              name: String(v[1]),
              type: String(v[2] || "TEXT").toUpperCase(),
              isPk: Number(v[5]) > 0,
            });
          });
        }

        // 3. Introspect foreign keys
        try {
          const fkRes = db.exec(`PRAGMA foreign_key_list("${tableName}");`);
          if (fkRes.length > 0) {
            fkRes[0].values.forEach((v) => {
              const targetTable = String(v[2]);
              const fromCol = String(v[3]);
              const toCol = String(v[4]);
              const col = colList.find((c) => c.name === fromCol);
              if (col) {
                col.fkTarget = { table: targetTable, column: toCol };
              }
            });
          }
        } catch {
          // Ignore FK introspection error on non-standard schemas
        }

        // Curated fallback relations for Sakila SQLite if foreign keys were declared logically
        if (activeDbName.toLowerCase().includes("sakila")) {
          colList.forEach((c) => {
            if (!c.fkTarget) {
              if (c.name === "film_id" && tableName !== "film") {
                c.fkTarget = { table: "film", column: "film_id" };
              } else if (c.name === "category_id" && tableName !== "category") {
                c.fkTarget = { table: "category", column: "category_id" };
              } else if (c.name === "actor_id" && tableName !== "actor") {
                c.fkTarget = { table: "actor", column: "actor_id" };
              } else if (c.name === "customer_id" && tableName !== "customer") {
                c.fkTarget = { table: "customer", column: "customer_id" };
              } else if (c.name === "rental_id" && tableName !== "rental") {
                c.fkTarget = { table: "rental", column: "rental_id" };
              }
            }
          });
        }

        return {
          name: tableName,
          columns: colList,
        };
      });
    } catch (e) {
      console.error("ERD introspection error:", e);
      return [];
    }
  }, [db, activeDbName]);

  // Extract all relationship links across tables
  const relationships = useMemo(() => {
    const links: { fromTable: string; fromCol: string; toTable: string; toCol: string }[] = [];
    tables.forEach((t) => {
      t.columns.forEach((c) => {
        if (c.fkTarget) {
          links.push({
            fromTable: t.name,
            fromCol: c.name,
            toTable: c.fkTarget.table,
            toCol: c.fkTarget.column,
          });
        }
      });
    });
    return links;
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    const q = searchQuery.toLowerCase();
    return tables.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.columns.some((c) => c.name.toLowerCase().includes(q))
    );
  }, [tables, searchQuery]);

  const copySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(snippet);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-925 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <GitFork className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Visual Schema & Entity-Relationship (ERD) Explorer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700">
                  {activeDbName}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {tables.length} tables · {relationships.length} relational foreign key links
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

        {/* Toolbar & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 py-2.5 border-b border-slate-800 bg-slate-900/80 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tables or columns (e.g. film, customer_id, rental)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Quick Relationship Highlights */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-400/80 inline-block" /> Primary Key (PK)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-sky-400/80 inline-block" /> Foreign Key (FK)
            </span>
          </div>
        </div>

        {/* ERD Relationship Summary Strip */}
        {relationships.length > 0 && (
          <div className="px-5 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto text-[11px] font-mono shrink-0">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Key Join Bridges:
              </span>
              {relationships.map((rel, idx) => {
                const joinSnippet = `${rel.fromTable}.${rel.fromCol} = ${rel.toTable}.${rel.toCol}`;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onInsertSnippet) onInsertSnippet(joinSnippet);
                      copySnippet(joinSnippet);
                    }}
                    title={`Click to copy join condition: ${joinSnippet}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-sky-300 border border-slate-700 transition shrink-0 group"
                  >
                    <span className="text-amber-400 font-semibold">{rel.fromTable}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-500 group-hover:text-sky-400" />
                    <span className="text-sky-400 font-semibold">{rel.toTable}</span>
                    {copiedSnippet === joinSnippet ? (
                      <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 text-slate-500 group-hover:text-slate-300 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Visual Grid of Table Cards */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              No matching tables found for "{searchQuery}".
            </div>
          ) : (
            filteredTables.map((table) => {
              const isSelected = selectedTable === table.name;
              const outgoingFks = table.columns.filter((c) => c.fkTarget);
              const incomingFks = relationships.filter((r) => r.toTable === table.name);

              return (
                <div
                  key={table.name}
                  onClick={() => setSelectedTable(table.name === selectedTable ? null : table.name)}
                  className={`flex flex-col rounded-xl border transition cursor-pointer overflow-hidden ${
                    isSelected
                      ? "bg-slate-900 border-sky-500 ring-1 ring-sky-500/50 shadow-lg"
                      : "bg-slate-950/70 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Table Header Card */}
                  <div className="px-3.5 py-2.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-bold font-mono text-xs text-slate-100">
                        {table.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      {table.columns.length} cols
                    </span>
                  </div>

                  {/* Columns List */}
                  <div className="p-3 divide-y divide-slate-850/80 text-xs font-mono max-h-56 overflow-y-auto">
                    {table.columns.map((col) => (
                      <div
                        key={col.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          const colSnippet = `${table.name}.${col.name}`;
                          if (onInsertSnippet) onInsertSnippet(colSnippet);
                          copySnippet(colSnippet);
                        }}
                        title={`Click to copy ${table.name}.${col.name}`}
                        className="py-1.5 flex items-center justify-between gap-2 hover:bg-slate-850/60 px-1.5 rounded transition group"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {col.isPk && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700 shrink-0">
                              <Key className="w-2.5 h-2.5" /> PK
                            </span>
                          )}
                          {col.fkTarget && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-700 shrink-0">
                              <Link2 className="w-2.5 h-2.5" /> FK
                            </span>
                          )}
                          <span
                            className={`truncate ${
                              col.isPk
                                ? "text-amber-300 font-bold"
                                : col.fkTarget
                                ? "text-sky-300 font-semibold"
                                : "text-slate-300"
                            }`}
                          >
                            {col.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {col.type}
                          </span>
                          {copiedSnippet === `${table.name}.${col.name}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Relationship Footer */}
                  {(outgoingFks.length > 0 || incomingFks.length > 0) && (
                    <div className="px-3 py-2 bg-slate-925/80 border-t border-slate-850 text-[10px] font-mono text-slate-400 space-y-1">
                      {outgoingFks.length > 0 && (
                        <div className="flex items-center gap-1 truncate">
                          <span className="text-slate-500">Links to:</span>
                          {outgoingFks.map((fk) => (
                            <span
                              key={fk.name}
                              className="px-1 py-0.2 rounded bg-slate-800 text-sky-300 border border-slate-700"
                            >
                              {fk.fkTarget?.table}
                            </span>
                          ))}
                        </div>
                      )}
                      {incomingFks.length > 0 && (
                        <div className="flex items-center gap-1 truncate">
                          <span className="text-slate-500">Referenced by:</span>
                          {incomingFks.slice(0, 3).map((rf, i) => (
                            <span
                              key={i}
                              className="px-1 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700"
                            >
                              {rf.fromTable}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Help Bar */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-925 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            💡 Click any column or join bridge to copy <code className="text-sky-300 font-mono font-bold">table.column</code> directly into your clipboard.
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
