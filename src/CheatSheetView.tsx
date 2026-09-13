import React, { useState } from "react";
import { BookOpen, AlertTriangle, ArrowRight, Layers, Database, Sparkles, Copy, Check } from "lucide-react";

interface SchemaTable {
  name: string;
  columns: string[];
}

interface CheatSheetViewProps {
  activeDbName?: string;
  schemaTables?: SchemaTable[];
}

export const CheatSheetView: React.FC<CheatSheetViewProps> = ({
  activeDbName = "Sakila SQLite",
  schemaTables = []
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  const isSakila = activeDbName.toLowerCase().includes("sakila");

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-6 space-y-8 text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-slate-100">SQL Mastery & Query Architecture Cheat Sheet</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Active Database: <strong className="text-sky-400 font-mono">{activeDbName}</strong> · High-yield reference of query execution order, common query patterns, and active schema.
        </p>
      </div>

      {/* 1. Conceptual Execution Order */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            1. Conceptual Query Execution Order (Very Important!)
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          You write SQL starting with <code className="text-sky-300">SELECT</code>, but the database engine processes it in a completely different order. This is why <code className="text-amber-300">WHERE</code> cannot see aliases defined in <code className="text-sky-300">SELECT</code>!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1 font-mono text-xs">
          {[
            { step: "1", clause: "FROM / JOIN", desc: "Load & connect raw tables" },
            { step: "2", clause: "WHERE", desc: "Filter individual rows" },
            { step: "3", clause: "GROUP BY", desc: "Collapse rows into groups" },
            { step: "4", clause: "HAVING", desc: "Filter aggregated groups" },
            { step: "5", clause: "SELECT", desc: "Compute cols & aliases" },
            { step: "6", clause: "ORDER BY", desc: "Sort final rows" },
            { step: "7", clause: "LIMIT", desc: "Paginate / truncate" },
          ].map((item) => (
            <div
              key={item.step}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500">STEP {item.step}</span>
                <div className="font-bold text-sky-400 mt-0.5 text-xs">{item.clause}</div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Classic Exam Traps */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            2. The 5 Classic Academic Exam Traps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-lg border border-rose-900/40 bg-rose-950/20 space-y-1.5">
            <span className="text-xs font-bold text-rose-300">Trap 1: COUNT(*) vs COUNT(column)</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <code className="text-rose-200">COUNT(*)</code> counts every row, including rows with NULLs.<br />
              <code className="text-emerald-300">COUNT(return_date)</code> ignores rows where return_date is NULL.<br />
              <em>Exam catch:</em> If a customer has rentals but none returned, COUNT(*) = 5, but COUNT(return_date) = 0!
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-900/40 bg-rose-950/20 space-y-1.5">
            <span className="text-xs font-bold text-rose-300">Trap 2: LEFT JOIN Filter in WHERE clause</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Placing a right-table condition in <code className="text-rose-200">WHERE r.amount &gt; 5</code> kills the LEFT JOIN and turns it into an INNER JOIN (unmatched rows have NULL amount, which fails WHERE).<br />
              <em>Fix:</em> Put right-table conditions inside the <code className="text-emerald-300">ON</code> clause!
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-900/40 bg-rose-950/20 space-y-1.5">
            <span className="text-xs font-bold text-rose-300">Trap 3: NULL Comparison & Arithmetic</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <code className="text-rose-200">col = NULL</code> is ALWAYS UNKNOWN (false in WHERE). Always use <code className="text-emerald-300">col IS NULL</code>.<br />
              Arithmetic with NULL: <code className="text-amber-200">10 + NULL = NULL</code>. Any operation with NULL yields NULL.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-900/40 bg-rose-950/20 space-y-1.5">
            <span className="text-xs font-bold text-rose-300">Trap 4: The Golden Rule of GROUP BY</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every column in <code className="text-sky-300">SELECT</code> that is NOT inside an aggregate function (<code className="text-violet-300">SUM, COUNT, AVG, MIN, MAX</code>) <strong>MUST</strong> appear in the <code className="text-amber-300">GROUP BY</code> clause.
            </p>
          </div>
        </div>
      </div>

      {/* 3. The 7 Core Query Patterns */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            3. The 7 Shapes to Memorize
          </h3>
        </div>

        <div className="space-y-2.5">
          {[
            {
              id: "p1",
              title: "Pattern 1 — Filter & Sort",
              code: "SELECT title, rental_rate FROM film\nWHERE rental_rate >= 2.99 AND rating = 'PG'\nORDER BY rental_rate DESC, title ASC\nLIMIT 5;",
            },
            {
              id: "p2",
              title: "Pattern 2 — Summary Aggregates",
              code: "SELECT COUNT(*) AS total_films, MIN(rental_rate) AS min_price, ROUND(AVG(rental_rate), 2) AS avg_price FROM film;",
            },
            {
              id: "p3",
              title: "Pattern 3 — GROUP BY with Count",
              code: "SELECT rating, COUNT(*) AS total_films\nFROM film\nGROUP BY rating\nORDER BY total_films DESC;",
            },
            {
              id: "p4",
              title: "Pattern 4 — GROUP BY + HAVING",
              code: "SELECT rating, COUNT(*) AS total_films\nFROM film\nGROUP BY rating\nHAVING COUNT(*) > 1\nORDER BY total_films DESC;",
            },
            {
              id: "p5",
              title: "Pattern 5 — 2-Table INNER JOIN",
              code: "SELECT c.first_name, c.last_name, p.amount, p.payment_date\nFROM customer c\nJOIN payment p ON c.customer_id = p.customer_id\nORDER BY p.payment_date DESC;",
            },
            {
              id: "p6",
              title: "Pattern 6 — JOIN + GROUP BY + Aggregates",
              code: "SELECT c.first_name, c.last_name, COUNT(p.payment_id) AS total_payments, SUM(p.amount) AS total_spent\nFROM customer c\nJOIN payment p ON c.customer_id = p.customer_id\nGROUP BY c.customer_id, c.first_name, c.last_name\nHAVING SUM(p.amount) > 5.00\nORDER BY total_spent DESC;",
            },
            {
              id: "p7",
              title: "Pattern 7 — Scalar & IN Subqueries",
              code: "-- 1. Scalar subquery (above average)\nSELECT title, rental_rate FROM film WHERE rental_rate > (SELECT AVG(rental_rate) FROM film);\n\n-- 2. IN subquery (matching customer set)\nSELECT first_name, last_name FROM customer WHERE customer_id IN (SELECT customer_id FROM payment WHERE amount >= 4.99);",
            },
          ].map((pat) => (
            <div key={pat.id} className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-300 font-mono">{pat.title}</span>
                <button
                  onClick={() => copySnippet(pat.id, pat.code)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
                >
                  {copiedSection === pat.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-850 text-slate-300 overflow-x-auto">
                {pat.code}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Active Database Schema Keys Reference */}
      <div className="space-y-3 pb-6">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            4. Schema & Table Reference ({activeDbName})
          </h3>
        </div>

        {isSakila ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono">
            {[
              { table: "film", pk: "film_id", fks: "—", cols: "title, rental_rate, length, rating" },
              { table: "category", pk: "category_id", fks: "—", cols: "name" },
              { table: "film_category", pk: "(film_id, category_id)", fks: "film_id, category_id", cols: "junction table" },
              { table: "actor", pk: "actor_id", fks: "—", cols: "first_name, last_name" },
              { table: "customer", pk: "customer_id", fks: "—", cols: "first_name, last_name, email, active" },
              { table: "rental", pk: "rental_id", fks: "film_id, customer_id", cols: "rental_date, return_date" },
              { table: "payment", pk: "payment_id", fks: "customer_id, rental_id", cols: "amount, payment_date" },
            ].map((item) => (
              <div key={item.table} className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
                <div className="text-amber-400 font-bold text-xs">{item.table}</div>
                <div className="text-[10px] text-slate-400">
                  <span className="text-slate-500">PK:</span> {item.pk}
                </div>
                <div className="text-[10px] text-slate-400">
                  <span className="text-slate-500">FKs:</span> {item.fks}
                </div>
                <div className="text-[10px] text-slate-500">{item.cols}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono">
            {schemaTables.length > 0 ? (
              schemaTables.map((table) => (
                <div key={table.name} className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-300 font-bold text-xs">{table.name}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      {table.columns.length} cols
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-relaxed max-h-24 overflow-y-auto">
                    {table.columns.join(", ")}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No tables detected in database.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
