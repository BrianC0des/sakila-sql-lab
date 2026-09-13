import React from "react";
import { CheckCircle2, AlertCircle, ArrowRight, Columns, Check, Eye } from "lucide-react";
import type { TestResult } from "@bridge/types";

interface ResultTableViewerProps {
  userColumns: string[];
  userRows: Record<string, any>[];
  expectedColumns: string[];
  expectedRows: Record<string, any>[];
  testResults: TestResult[];
  errorMessage: string | null;
  nextMilestone: { targetIdx: number; label: string; nextCategory: string | null } | null;
  onAdvanceMilestone: () => void;
  resultTab: "user" | "expected" | "diff";
  onResultTabChange: (tab: "user" | "expected" | "diff") => void;
}

export const ResultTableViewer: React.FC<ResultTableViewerProps> = ({
  userColumns,
  userRows,
  expectedColumns,
  expectedRows,
  testResults,
  errorMessage,
  nextMilestone,
  onAdvanceMilestone,
  resultTab,
  onResultTabChange,
}) => {
  const hasExecuted = userRows.length > 0 || errorMessage !== null || testResults.length > 0;
  const isPassed = testResults.length > 0 && testResults[0].passed;
  const hasDiffData = expectedRows.length > 0;

  // Render a single SQL table
  const renderTable = (columns: string[], rows: Record<string, any>[], emptyMessage = "No rows returned.") => {
    if (rows.length === 0) {
      return (
        <div className="p-6 text-center text-xs text-slate-500 italic">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="border border-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse text-left">
          <thead>
            <tr className="bg-slate-850 text-slate-300 border-b border-slate-750">
              {columns.map((col) => (
                <th key={col} className="p-2.5 border-r border-slate-750 last:border-r-0 font-semibold tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-slate-800/80 hover:bg-slate-850/50 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="p-2 border-r border-slate-850 last:border-r-0 text-slate-200">
                    {row[col] === null ? (
                      <span className="text-amber-400/80 italic font-semibold">NULL</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-slate-925 text-slate-200">
      {/* ── Status Banner (Passed / Failed / Error) ── */}
      <div className="p-3 pb-2 shrink-0">
        {testResults.length > 0 && (
          isPassed ? (
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All assertions passed! Milestone completed.</span>
              </span>
              {nextMilestone && (
                <button
                  onClick={onAdvanceMilestone}
                  className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[11px] font-semibold transition shadow-sm flex items-center gap-1"
                >
                  <span>{nextMilestone.label}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-700/80 text-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Assertion Failed:</strong> {testResults[0].message}
                </span>
              </div>
              {hasDiffData && resultTab !== "diff" && (
                <button
                  onClick={() => onResultTabChange("diff")}
                  className="px-2 py-0.5 rounded bg-amber-900/60 hover:bg-amber-800/80 text-amber-100 border border-amber-600 font-mono text-[10px] font-semibold transition shrink-0"
                >
                  View Diff Tab →
                </button>
              )}
            </div>
          )
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono mt-2">
            <strong>SQL Syntax Error:</strong> {errorMessage}
          </div>
        )}
      </div>

      {/* ── Table Tabs Navigation Bar ── */}
      {hasExecuted && !errorMessage && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-y border-slate-800 text-xs font-mono shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Tab 1: Your Output */}
            <button
              onClick={() => onResultTabChange("user")}
              className={`px-2.5 py-1 rounded-md transition text-xs font-medium flex items-center gap-1.5 ${
                resultTab === "user"
                  ? "bg-sky-950 text-sky-200 border border-sky-600 font-semibold shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <span>Your Output</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                {userRows.length} rows
              </span>
            </button>

            {/* Tab 2: Expected Output */}
            {hasDiffData && (
              <button
                onClick={() => onResultTabChange("expected")}
                className={`px-2.5 py-1 rounded-md transition text-xs font-medium flex items-center gap-1.5 ${
                  resultTab === "expected"
                    ? "bg-emerald-950 text-emerald-200 border border-emerald-600 font-semibold shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <span>Expected Output</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                  {expectedRows.length} rows
                </span>
              </button>
            )}

            {/* Tab 3: Side-by-Side Diff */}
            {hasDiffData && (
              <button
                onClick={() => onResultTabChange("diff")}
                className={`px-2.5 py-1 rounded-md transition text-xs font-medium flex items-center gap-1.5 ${
                  resultTab === "diff"
                    ? "bg-purple-950 text-purple-200 border border-purple-600 font-semibold shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side Diff</span>
                {!isPassed && testResults.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block">
            {resultTab === "user" && `${userColumns.length} columns displayed`}
            {resultTab === "expected" && `${expectedColumns.length} reference columns`}
            {resultTab === "diff" && "Comparing output tables"}
          </div>
        </div>
      )}

      {/* ── Table Content Area ── */}
      <div className="flex-1 p-3 overflow-auto min-h-0">
        {!hasExecuted ? (
          <div className="flex flex-col items-center justify-center h-full text-xs text-slate-500 space-y-1">
            <span>Press "Run Query" or Ctrl+Enter to execute.</span>
            <span className="text-[11px] text-slate-600">Query results and expected output will display here.</span>
          </div>
        ) : resultTab === "user" ? (
          renderTable(userColumns, userRows)
        ) : resultTab === "expected" ? (
          renderTable(expectedColumns, expectedRows, "No expected rows found.")
        ) : (
          /* Side-by-Side Diff Mode */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full">
            {/* Left: Your Output */}
            <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-950/40 p-2 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                <span className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
                  <span>Your Query Output</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {userRows.length} rows
                  </span>
                </span>
                {userRows.length !== expectedRows.length && (
                  <span className="text-[10px] text-rose-400 font-mono">
                    Mismatch: {userRows.length} vs {expectedRows.length}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-auto">
                {renderTable(userColumns, userRows)}
              </div>
            </div>

            {/* Right: Expected Output */}
            <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-950/40 p-2 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Target Reference Output</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {expectedRows.length} rows
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {expectedColumns.join(", ")}
                </span>
              </div>
              <div className="flex-1 overflow-auto">
                {renderTable(expectedColumns, expectedRows)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
