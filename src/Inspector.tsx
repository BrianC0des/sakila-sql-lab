import React from "react";

interface InspectorProps {
  executionMs: number;
  rowCount: number;
  explainPlan?: { id: number; parent: number; notused: number; detail: string }[];
  schemaTables?: { name: string; columns: string[] }[];
}

export const Inspector: React.FC<InspectorProps> = ({
  executionMs,
  rowCount,
  explainPlan = [],
  schemaTables = []
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-800 text-slate-200 text-xs font-mono">
      {/* Metrics Bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-slate-950/80 border-b border-slate-800">
        <span className="text-slate-400">
          Duration: <strong className="text-emerald-400">{executionMs.toFixed(2)} ms</strong>
        </span>
        <span className="text-slate-400">
          Rows: <strong className="text-sky-400">{rowCount}</strong>
        </span>
        <span className="text-slate-500">Engine: SQLite WASM / In-Memory</span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 overflow-y-auto flex-1">
        {/* EXPLAIN QUERY PLAN */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Execution Plan (EXPLAIN)
          </h4>
          {explainPlan.length === 0 ? (
            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-500">
              Run a query to inspect the query optimizer tree.
            </div>
          ) : (
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              {explainPlan.map((plan, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-600">[{plan.id}]</span>
                  <span className="text-sky-300">{plan.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schema Viewer */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Active Schema Tables
          </h4>
          <div className="space-y-2">
            {schemaTables.map((t) => (
              <div key={t.name} className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400">{t.name}</span>
                <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-1">
                  {t.columns.map((c) => (
                    <span key={c} className="px-1.5 py-0.5 bg-slate-800 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
