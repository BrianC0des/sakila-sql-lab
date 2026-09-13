import React, { useState, useRef, useEffect } from "react";
import {
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Database,
  FileCode,
  Layers,
  Sparkles,
  HardDrive,
  ChevronDown,
} from "lucide-react";
import type { SqlChallenge } from "./challenges";
import type { Database as SqlJsDatabase } from "sql.js";

interface SchemaTable {
  name: string;
  columns: string[];
}

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: SqlJsDatabase | null;
  activeDbName: string;
  onLoadCustomDb: (newDb: SqlJsDatabase, name: string) => void;
  onResetDb: () => void;
  schemaTables: SchemaTable[];
  customChallenges: SqlChallenge[];
  onImportChallenges: (challenges: SqlChallenge[]) => void;
  onDeleteChallenge: (id: string) => void;
  onClearCustomChallenges: () => void;
  completedMilestones: string[];
  onResetProgress: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  db,
  activeDbName,
  onLoadCustomDb,
  onResetDb,
  schemaTables,
  customChallenges,
  onImportChallenges,
  onDeleteChallenge,
  onClearCustomChallenges,
  completedMilestones,
  onResetProgress,
}) => {
  const [activeTab, setActiveTab] = useState<"database" | "import" | "manage" | "prompt" | "export">("database");
  const [jsonInput, setJsonInput] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isProcessingDb, setIsProcessingDb] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbSuccess, setDbSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<{
    success: boolean | null;
    message?: string;
    verifiedCount?: number;
    failedCount?: number;
    details?: { title: string; passed: boolean; error?: string; rowCount?: number }[];
  }>({ success: null });

  const [promptCount, setPromptCount] = useState<number>(10);
  const [promptClarity, setPromptClarity] = useState<"crystal-clear" | "balanced" | "exploratory">("crystal-clear");
  const [promptCustomTags, setPromptCustomTags] = useState<string>("joins, aggregates, filtering");
  const [selectedExportTable, setSelectedExportTable] = useState<string>("");
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const tableDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(e.target as Node)) {
        setIsTableDropdownOpen(false);
      }
    };
    if (isTableDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isTableDropdownOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Generate dynamic AI prompt based on currently loaded schema & user preferences
  const generateAiPrompt = () => {
    const tableListStr = schemaTables.length > 0
      ? schemaTables.map(t => `- ${t.name} (${t.columns.join(", ")})`).join("\n")
      : "- film (film_id, title, rental_rate, length, rating)\n- category (category_id, name)\n- film_category (film_id, category_id)\n- actor (actor_id, first_name, last_name)\n- customer (customer_id, first_name, last_name, email, active)\n- rental (rental_id, rental_date, film_id, customer_id, return_date)\n- payment (payment_id, customer_id, rental_id, amount, payment_date)";

    const topicInstruction = promptCustomTags.trim()
      ? `Focus specifically on challenges covering these topic concepts and tags: ${promptCustomTags.trim()}`
      : `Balanced curriculum: Cover a well-rounded mix of foundations (SELECT, WHERE, LIMIT), aggregations (GROUP BY, HAVING), relational JOINs (INNER, LEFT), and subqueries.`;

    const clarityDescriptions: Record<string, string> = {
      "crystal-clear": `Highest Clarity (Explicit Specifications):
- Explicitly state exact table names, column names, and prescribed column aliases (e.g., "alias count as total_rentals", "alias average as avg_price").
- Explicitly state exact filtering conditions, string matching rules, and ORDER BY direction.
- Zero ambiguity: Ensure students know the exact shape and naming of the expected output table so automated test suites evaluate with 100% precision.`,
      "balanced": `Balanced Scenario (Real-World Context with Clear Criteria):
- Present a realistic business scenario with clear business questions.
- Clearly describe the required metrics, target entities, and filtering rules.
- State desired column names without being overly prescriptive on intermediate steps, while keeping reference solutions standard.`,
      "exploratory": `Exploratory / Business Ticket Style (High Autonomy):
- Write the prompt like a real-world stakeholder request or bug ticket.
- Describe the business objective (e.g. "Identify repeat customers with above-average spend who haven't rented this month").
- Encourage the student to investigate the database schema, identify the necessary tables and join relationships, and design their own query structure.`
    };

    return `You are an expert SQL teacher and curriculum designer.
Generate a batch of exactly ${promptCount} hands-on practice SQL questions for the following SQLite database.

### ACTIVE DATABASE SCHEMA (${activeDbName}):
${tableListStr}

### TOPICS & FOCUS CONCEPTS:
${topicInstruction}

### PROBLEM CLARITY & GUIDANCE STYLE:
${clarityDescriptions[promptClarity]}

### STRICT PROBLEM SPECIFICATION & CLARITY RULES:
1. Every challenge "description" MUST have high clarity:
   - State the task clearly in 2-3 sentences.
   - Explicitly list the expected output columns and any required aliases.
   - Specify exact filtering conditions and ORDER BY / LIMIT rules.
2. The "referenceSolution" must strictly match the requirements in the description so query evaluation is 100% deterministic.

### OUTPUT FORMAT REQUIREMENTS:
1. Return ONLY a single raw JSON object matching the schema below.
2. Do NOT wrap in conversational text or markdown explanation.
3. Keep \`starterQuery\` completely empty ("") so students write their queries from scratch.
4. Set \`requireOrder: true\` whenever the prompt instructs students to sort/order their results.
5. Provide 2-3 progressive, pedagogical hints per challenge (Hint 1: concept/clause, Hint 2: syntax tip, Hint 3: tricky edge cases).
6. Ensure EVERY \`referenceSolution\` is 100% valid SQLite syntax against the exact table and column names listed above.
7. Assign 2-4 lowercase topic \`tags\` to each challenge representing concepts used (e.g. ["joins", "inner-join"], ["aggregates", "group-by"], ["subqueries"], ["filtering", "where"]).

### JSON STRUCTURE:
{
  "challenges": [
    {
      "id": "batch-1",
      "title": "Clear & Concise Milestone Title",
      "description": "Step-by-step instructions specifying which columns to select, which table(s) to query, filters to apply, and sorting/limit requirements.",
      "difficulty": "beginner",
      "tags": ["select", "where", "order-by"],
      "requireOrder": true,
      "hints": [
        "First hint describing which SQL clause to use.",
        "Second hint detailing how to structure the clause."
      ],
      "starterQuery": "",
      "referenceSolution": "SELECT col1, col2 FROM table1 WHERE col1 > 10 ORDER BY col1 ASC;"
    },
    {
      "id": "batch-2",
      "title": "Another Challenge Title",
      "description": "Clear challenge instructions with expected columns and conditions.",
      "difficulty": "intermediate",
      "tags": ["aggregates", "group-by"],
      "requireOrder": false,
      "hints": [
        "Hint explaining GROUP BY and aggregate functions."
      ],
      "starterQuery": "",
      "referenceSolution": "SELECT col1, COUNT(*) AS count_val FROM table1 GROUP BY col1;"
    }
  ]
}`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generateAiPrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // ─── Database File Import Handler ──────────────────────────────────────────
  const handleDatabaseFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingDb(true);
    setDbError(null);
    setDbSuccess(null);

    try {
      // Access SQL from sql.js
      const initSqlJs = (await import("sql.js")).default;
      const sqlWasmUrl = (await import("sql.js/dist/sql-wasm.wasm?url")).default;
      const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });

      let newDb: SqlJsDatabase;

      if (file.name.endsWith(".sql")) {
        const text = await file.text();
        newDb = new SQL.Database();
        newDb.run(text);
      } else {
        const buffer = await file.arrayBuffer();
        newDb = new SQL.Database(new Uint8Array(buffer));
      }

      // Verify that the database contains tables
      const check = newDb.exec("SELECT count(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      const count = check[0]?.values[0]?.[0] || 0;

      if (Number(count) === 0) {
        throw new Error("The selected file does not contain any user tables.");
      }

      onLoadCustomDb(newDb, file.name);
      setDbSuccess(`Loaded "${file.name}" with ${count} tables successfully!`);
    } catch (err: any) {
      setDbError(err.message || "Failed to parse database file.");
    } finally {
      setIsProcessingDb(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── Database Export Handlers ──────────────────────────────────────────────
  const handleExportBinaryDb = (ext: "db" | "sqlite" | "sqlite3" = "db") => {
    if (!db) {
      setDbError("No database is currently loaded to export.");
      return;
    }
    setDbError(null);
    try {
      const binary = db.export();
      const blob = new Blob([binary], { type: "application/x-sqlite3" });
      const cleanName = activeDbName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") || "database";
      const fileName = `${cleanName}-${new Date().toISOString().slice(0, 10)}.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDbSuccess(`Exported "${fileName}" (${Math.round(binary.length / 1024)} KB) successfully!`);
      setTimeout(() => setDbSuccess(null), 5000);
    } catch (err: any) {
      setDbError(`Failed to export .${ext} database: ` + (err.message || String(err)));
    }
  };

  const handleExportTableCsv = (tableName: string) => {
    if (!db || !tableName) return;
    try {
      const res = db.exec(`SELECT * FROM "${tableName}";`);
      if (!res.length) {
        setDbError(`Table "${tableName}" is empty or has no data.`);
        return;
      }
      const cols = res[0].columns;
      const values = res[0].values;

      let csv = cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(",") + "\n";
      for (const row of values) {
        csv +=
          row
            .map((v) => {
              if (v === null) return "";
              const str = String(v);
              return `"${str.replace(/"/g, '""')}"`;
            })
            .join(",") + "\n";
      }

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const cleanDb = activeDbName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const fileName = `${cleanDb}-${tableName}-${new Date().toISOString().slice(0, 10)}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDbSuccess(`Exported table "${tableName}" as CSV (${values.length} rows)!`);
      setTimeout(() => setDbSuccess(null), 5000);
    } catch (err: any) {
      setDbError(`Failed to export CSV: ${err.message || String(err)}`);
    }
  };

  const handleExportTableJson = (tableName: string) => {
    if (!db || !tableName) return;
    try {
      const res = db.exec(`SELECT * FROM "${tableName}";`);
      if (!res.length) {
        setDbError(`Table "${tableName}" is empty or has no data.`);
        return;
      }
      const cols = res[0].columns;
      const values = res[0].values;
      const jsonList = values.map((row) => {
        const obj: Record<string, any> = {};
        cols.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });

      const blob = new Blob([JSON.stringify(jsonList, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const cleanDb = activeDbName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const fileName = `${cleanDb}-${tableName}-${new Date().toISOString().slice(0, 10)}.json`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDbSuccess(`Exported table "${tableName}" as JSON (${values.length} records)!`);
      setTimeout(() => setDbSuccess(null), 5000);
    } catch (err: any) {
      setDbError(`Failed to export JSON: ${err.message || String(err)}`);
    }
  };

  const handleExportSqlDump = () => {
    if (!db) {
      setDbError("No database is currently loaded to export.");
      return;
    }
    setDbError(null);
    try {
      let sqlContent = `-- ========================================================\n`;
      sqlContent += `-- SQL Studio Database Dump: ${activeDbName}\n`;
      sqlContent += `-- Exported At: ${new Date().toISOString()}\n`;
      sqlContent += `-- Total Schema Tables: ${schemaTables.length}\n`;
      sqlContent += `-- ========================================================\n\n`;

      const masterRes = db.exec(
        "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY CASE type WHEN 'table' THEN 1 WHEN 'view' THEN 2 WHEN 'index' THEN 3 ELSE 4 END, name ASC;"
      );

      if (masterRes.length > 0) {
        const rows = masterRes[0].values;
        for (const row of rows) {
          const type = String(row[0]);
          const name = String(row[1]);
          const sql = String(row[2]);

          sqlContent += `-- ─── ${type.toUpperCase()}: ${name} ───\n`;
          sqlContent += `${sql};\n\n`;

          if (type === "table") {
            try {
              const dataRes = db.exec(`SELECT * FROM "${name}" LIMIT 500;`);
              if (dataRes.length > 0) {
                const cols = dataRes[0].columns;
                const values = dataRes[0].values;
                if (values.length > 0) {
                  sqlContent += `-- Data for ${name} (${values.length} rows)\n`;
                  for (const valRow of values) {
                    const formattedVals = valRow.map((v) => {
                      if (v === null) return "NULL";
                      if (typeof v === "number") return v;
                      return `'${String(v).replace(/'/g, "''")}'`;
                    });
                    sqlContent += `INSERT INTO "${name}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${formattedVals.join(", ")});\n`;
                  }
                  sqlContent += "\n";
                }
              }
            } catch {
              // ignore table read errors if any
            }
          }
        }
      }

      const cleanName = activeDbName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") || "database";
      const fileName = `${cleanName}-dump-${new Date().toISOString().slice(0, 10)}.sql`;
      const blob = new Blob([sqlContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDbSuccess(`Exported SQL script "${fileName}" successfully!`);
      setTimeout(() => setDbSuccess(null), 5000);
    } catch (err: any) {
      setDbError("Failed to export SQL script: " + (err.message || String(err)));
    }
  };

  // ─── Batch Question JSON Parser & Verifier ─────────────────────────────────
  const processBatchJson = (rawJson: string) => {
    setImportStatus({ success: null });
    try {
      const parsed = JSON.parse(rawJson);
      let rawList: any[] = [];

      if (Array.isArray(parsed)) {
        rawList = parsed;
      } else if (Array.isArray(parsed.challenges)) {
        rawList = parsed.challenges;
      } else if (Array.isArray(parsed.batches)) {
        for (const b of parsed.batches) {
          if (Array.isArray(b.challenges)) {
            rawList.push(...b.challenges);
          }
        }
      } else {
        throw new Error("JSON must contain an array of challenges or { 'challenges': [...] }.");
      }

      if (rawList.length === 0) {
        throw new Error("No challenges found in JSON.");
      }

      const verifiedChallenges: SqlChallenge[] = [];
      const details: { title: string; passed: boolean; error?: string; rowCount?: number }[] = [];

      for (const [idx, item] of rawList.entries()) {
        const title = item.title || `Challenge #${idx + 1}`;
        const refSol = item.referenceSolution?.trim();

        if (!refSol) {
          details.push({ title, passed: false, error: "Missing referenceSolution SQL" });
          continue;
        }

        // Validate against currently loaded database
        let passed = true;
        let errMsg: string | undefined;
        let rowCount = 0;

        if (db) {
          try {
            const res = db.exec(refSol);
            rowCount = res[0]?.values?.length || 0;
          } catch (sqlErr: any) {
            passed = false;
            errMsg = sqlErr.message;
          }
        }

        details.push({ title, passed, error: errMsg, rowCount });

        if (passed) {
          const rawDiff = String(item.difficulty || "").toLowerCase().trim();
          const validDifficulties = ["beginner", "intermediate", "advanced"];
          const difficulty = validDifficulties.includes(rawDiff) ? rawDiff : "intermediate";

          const safeId = item.id && !item.id.startsWith("batch-") && !item.id.startsWith("challenge-")
            ? item.id
            : `custom-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`;

          verifiedChallenges.push({
            id: safeId,
            title,
            description: item.description || "",
            difficulty,
            tags: Array.from(
              new Set([
                ...(Array.isArray(item.tags) && item.tags.length > 0
                  ? item.tags.map((t: any) => String(t).toLowerCase().trim())
                  : [difficulty]),
                "custom",
              ])
            ),
            requireOrder: item.requireOrder ?? true,
            hints: Array.isArray(item.hints) ? item.hints : [],
            starterQuery: "",
            referenceSolution: refSol,
            isCustom: true,
          });
        }
      }

      if (verifiedChallenges.length > 0) {
        onImportChallenges(verifiedChallenges);
        setImportStatus({
          success: true,
          verifiedCount: verifiedChallenges.length,
          failedCount: details.filter((d) => !d.passed).length,
          message: `Successfully imported ${verifiedChallenges.length} verified challenge(s)!`,
          details,
        });
        setJsonInput("");
      } else {
        setImportStatus({
          success: false,
          verifiedCount: 0,
          failedCount: details.length,
          message: "All questions failed reference query validation against the active database.",
          details,
        });
      }
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: err.message || "Invalid JSON format.",
      });
    }
  };

  const handleJsonFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setJsonInput(text);
      processBatchJson(text);
    } catch (err: any) {
      setImportStatus({ success: false, message: "Could not read JSON file." });
    } finally {
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Lab Manager: Database & Custom Questions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Load local databases, import AI batches, manage questions, and sync progress.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 gap-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("database")}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap inline-flex items-center gap-1.5 ${
              activeTab === "database"
                ? "border-sky-400 text-sky-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Database ({activeDbName.length > 15 ? activeDbName.slice(0, 15) + "…" : activeDbName})</span>
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap inline-flex items-center gap-1.5 ${
              activeTab === "import"
                ? "border-sky-400 text-sky-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Batch Import</span>
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap inline-flex items-center gap-1.5 ${
              activeTab === "manage"
                ? "border-sky-400 text-sky-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Manage Questions ({customChallenges.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("prompt")}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap inline-flex items-center gap-1.5 ${
              activeTab === "prompt"
                ? "border-sky-400 text-sky-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Prompt</span>
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap inline-flex items-center gap-1.5 ${
              activeTab === "export"
                ? "border-sky-400 text-sky-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-rose-400" />
            <span>Backup & Reset</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: Database Management */}
          {activeTab === "database" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">Active Database:</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                    {activeDbName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tables available: <strong className="text-slate-300">{schemaTables.length} tables</strong> (
                  {schemaTables.map((t) => t.name).slice(0, 5).join(", ")}
                  {schemaTables.length > 5 ? "..." : ""})
                </p>
              </div>

              {/* Upload Local Database */}
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-950 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-sky-400" />
                  Import Local Database File
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Select a local SQLite database (<code>.db</code>, <code>.sqlite</code>, <code>.sqlite3</code>) or SQL seed script (<code>.sql</code>). The lab will load it in-memory instantly in the browser.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleDatabaseFileUpload}
                  accept=".db,.sqlite,.sqlite3,.sql"
                  className="hidden"
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingDb}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isProcessingDb ? "Loading Database..." : "Choose Local DB File"}
                  </button>

                  <button
                    onClick={onResetDb}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    Reset to Sakila Default
                  </button>
                </div>

                {dbSuccess && (
                  <div className="p-2.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{dbSuccess}</span>
                  </div>
                )}

                {dbError && (
                  <div className="p-2.5 rounded bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{dbError}</span>
                  </div>
                )}
              </div>

              {/* Export Active Database & Tables */}
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-950 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    Export Active Database & Tables
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {schemaTables.length} Tables Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Export the full database as a standard <strong>.db</strong>, <strong>.sqlite</strong>, or <strong>.sqlite3</strong> binary file (all 100% genuine SQLite formats supported by DB Browser, DBeaver, and VS Code), or download a human-readable <strong>.sql</strong> script and table datasets.
                </p>

                {/* 1. Full Database Binary Export (.db / .sqlite / .sqlite3) */}
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    1. Full Database Binary (.db / .sqlite / .sqlite3)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleExportBinaryDb("db")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
                      title="Export as standard .db file (Universal format for DB Browser, Python sqlite3, Android)"
                    >
                      <Database className="w-3.5 h-3.5" />
                      Download .db (Standard)
                    </button>

                    <button
                      onClick={() => handleExportBinaryDb("sqlite")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
                      title="Export with .sqlite file extension"
                    >
                      Download .sqlite
                    </button>

                    <button
                      onClick={() => handleExportBinaryDb("sqlite3")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
                      title="Export with .sqlite3 file extension"
                    >
                      Download .sqlite3
                    </button>
                  </div>
                </div>

                {/* 2. SQL Script & DDL Dump */}
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    2. SQL Script & DDL Dump (.sql)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleExportSqlDump}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
                      title="Export complete CREATE TABLE DDL and INSERT data statements"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      Download SQL Script (.sql)
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Compatible with MySQL, phpMyAdmin / XAMPP, and SQLite CLI
                    </span>
                  </div>
                </div>

                {/* 3. Individual Table Data Export (CSV / JSON) */}
                {schemaTables.length > 0 && (
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      3. Export Specific Table Data (CSV / JSON)
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <div ref={tableDropdownRef} className="relative">
                        <button
                          type="button"
                          data-test="table-export-trigger"
                          onClick={() => setIsTableDropdownOpen((prev) => !prev)}
                          className="inline-flex items-center justify-between gap-3 text-xs bg-slate-950 border border-slate-700 hover:border-sky-500 rounded px-3 py-1.5 text-slate-200 font-mono transition cursor-pointer min-w-[220px]"
                        >
                          <span className="truncate">
                            Table: <strong className="text-sky-300">{selectedExportTable || schemaTables[0]?.name || "Select table"}</strong>
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                              isTableDropdownOpen ? "rotate-180 text-sky-400" : ""
                            }`}
                          />
                        </button>

                        {isTableDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 w-64 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                            {schemaTables.map((t) => {
                              const isSelected = (selectedExportTable || schemaTables[0]?.name) === t.name;
                              return (
                                <button
                                  key={t.name}
                                  type="button"
                                  onClick={() => {
                                    setSelectedExportTable(t.name);
                                    setIsTableDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition text-left cursor-pointer ${
                                    isSelected
                                      ? "bg-sky-950 text-sky-200 border border-sky-600 font-semibold"
                                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                  }`}
                                >
                                  <span className="truncate">{t.name}</span>
                                  <span className="text-[10px] text-slate-400 shrink-0 font-sans ml-2">
                                    {t.columns.length} cols
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleExportTableCsv(selectedExportTable || schemaTables[0]?.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
                        title="Download table rows as CSV spreadsheet"
                      >
                        <Download className="w-3 h-3 text-emerald-400" />
                        Export .csv
                      </button>

                      <button
                        onClick={() => handleExportTableJson(selectedExportTable || schemaTables[0]?.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
                        title="Download table rows as JSON array"
                      >
                        <Download className="w-3 h-3 text-purple-400" />
                        Export .json
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Batch Import Questions */}
          {activeTab === "import" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">
                  Paste JSON questions or upload a <code>.json</code> file. Every question will be verified against the active database before importing.
                </p>
                <input
                  type="file"
                  ref={jsonFileInputRef}
                  onChange={handleJsonFileUpload}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition shrink-0"
                >
                  <FileCode className="w-3 h-3 text-sky-400" />
                  Upload .json
                </button>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Paste JSON: { "challenges": [ ... ] } or [ ... ]'
                className="w-full h-44 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                spellCheck={false}
              />

              {importStatus.success !== null && (
                <div
                  className={`p-3 rounded-lg border text-xs space-y-2 ${
                    importStatus.success
                      ? "bg-emerald-950/70 border-emerald-800 text-emerald-300"
                      : "bg-rose-950/70 border-rose-800 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {importStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{importStatus.message}</span>
                  </div>

                  {importStatus.details && importStatus.details.length > 0 && (
                    <div className="max-h-32 overflow-y-auto space-y-1 font-mono text-[10px] pt-1">
                      {importStatus.details.map((d, i) => (
                        <div key={i} className="flex items-center justify-between border-t border-slate-800/60 pt-1">
                          <span className="truncate pr-2">{d.title}</span>
                          {d.passed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                              <Check className="w-3 h-3" />
                              <span>Valid ({d.rowCount} rows)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold shrink-0">
                              <X className="w-3 h-3" />
                              <span>{d.error}</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => processBatchJson(jsonInput)}
                  disabled={!jsonInput.trim()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-semibold transition"
                >
                  Verify & Import Questions
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Manage / Delete Questions */}
          {activeTab === "manage" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Custom Imported Questions ({customChallenges.length})
                </span>
                {customChallenges.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Delete all custom questions?")) {
                        onClearCustomChallenges();
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-rose-950/50 hover:bg-rose-900 border border-rose-800/80 text-rose-300 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All Custom Questions
                  </button>
                )}
              </div>

              {customChallenges.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-lg border border-slate-800 text-slate-500 text-xs">
                  No custom questions imported yet. Use the <strong>Batch Import</strong> tab to add questions!
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {customChallenges.map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 truncate">{c.title}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {c.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                        <div className="mt-1.5 font-mono text-[10px] text-sky-400 truncate">
                          <code>{c.referenceSolution}</code>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteChallenge(c.id)}
                        title="Delete question"
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800 transition shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI Prompt Generator */}
          {activeTab === "prompt" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="flex flex-col justify-end h-full">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 h-4 leading-4 truncate" title="Batch Size (Questions)">
                    Batch Size (Questions)
                  </label>
                  <select
                    value={promptCount}
                    onChange={(e) => setPromptCount(Number(e.target.value))}
                    className="w-full h-8 bg-slate-900 border border-slate-700 rounded px-2 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500 cursor-pointer"
                  >
                    <option value={5}>5 Questions (Quick Review)</option>
                    <option value={10}>10 Questions (Standard Quiz)</option>
                    <option value={15}>15 Questions (Deep Practice)</option>
                    <option value={20}>20 Questions (Full Exam Prep)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end h-full">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 h-4 leading-4 truncate" title="Problem Clarity & Guidance">
                    Problem Clarity & Guidance
                  </label>
                  <select
                    data-test="prompt-clarity-select"
                    value={promptClarity}
                    onChange={(e) => setPromptClarity(e.target.value as any)}
                    className="w-full h-8 bg-slate-900 border border-slate-700 rounded px-2 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500 cursor-pointer"
                  >
                    <option value="crystal-clear">Crystal Clear (Explicit Specs & Aliases)</option>
                    <option value="balanced">Balanced (Scenario + Clear Goals)</option>
                    <option value="exploratory">Exploratory (Real-World Ticket)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end h-full">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 h-4 leading-4 truncate" title="Topic Tags (comma-separated or click presets below)">
                    Topic Tags (Flexible Topics)
                  </label>
                  <input
                    type="text"
                    value={promptCustomTags}
                    onChange={(e) => setPromptCustomTags(e.target.value)}
                    placeholder="e.g. joins, subqueries, group-by"
                    className="w-full h-8 bg-slate-900 border border-slate-700 rounded px-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick Topic Preset Chips for Maximum Flexibility */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-400 font-medium mr-1">Topic Presets:</span>
                {[
                  { label: "Balanced", tags: "joins, aggregates, filtering, subqueries" },
                  { label: "Foundations", tags: "select, where, operators, order-by, limit" },
                  { label: "Aggregations", tags: "group-by, having, count, sum, avg" },
                  { label: "Relational JOINs", tags: "inner-join, left-join, multi-table" },
                  { label: "Advanced", tags: "subqueries, case-when, date-time, self-join" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPromptCustomTags(preset.tags)}
                    className={`text-[10px] px-2 py-0.5 rounded transition cursor-pointer font-sans border ${
                      promptCustomTags === preset.tags
                        ? "bg-sky-950 text-sky-200 border-sky-600 font-semibold"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Ready-to-use Batch Prompt for ChatGPT / Claude / DeepSeek:
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono transition shadow"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Batch Prompt
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto select-all">
                {generateAiPrompt()}
              </pre>

              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/50 p-2.5 rounded border border-slate-800">
                <p className="text-sky-300 font-semibold">Workflow for Classmates:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-300">
                  <li>Click <strong>Copy Batch Prompt</strong> above.</li>
                  <li>Paste into Claude, ChatGPT, or DeepSeek.</li>
                  <li>Copy the AI's JSON output and switch to the <strong>Batch Import</strong> tab to load & verify the questions!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 5: Export / Reset */}
          {activeTab === "export" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200">Export Progress & Custom Questions</h4>
                <p className="text-xs text-slate-400">
                  Completed Milestones: <strong className="text-emerald-400">{completedMilestones.length}</strong> · Custom Questions: <strong className="text-sky-400">{customChallenges.length}</strong>
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const data = {
                        exportedAt: new Date().toISOString(),
                        completedMilestones,
                        customChallenges,
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `sql-lab-backup-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    Download Backup JSON
                  </button>

                  <button
                    onClick={() => handleExportBinaryDb("db")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition ml-2"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-300" />
                    Export DB (.db)
                  </button>

                  <button
                    onClick={() => handleExportBinaryDb("sqlite")}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700 transition ml-2"
                  >
                    Export .sqlite
                  </button>

                  <button
                    onClick={handleExportSqlDump}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 transition ml-2"
                  >
                    <FileCode className="w-3.5 h-3.5 text-sky-400" />
                    Export SQL Script (.sql)
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
                <h4 className="text-xs font-bold text-rose-300">Reset Local Progress</h4>
                <p className="text-xs text-slate-400">
                  Clears all milestone checkmarks and custom questions from this browser.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to reset all progress on this browser?")) {
                        onResetProgress();
                        onClose();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 rounded text-xs font-semibold border border-rose-800/60 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                    Reset All Progress
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
