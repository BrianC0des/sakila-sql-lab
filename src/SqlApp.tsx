import React, { useState, useEffect, useCallback, useMemo } from "react";
import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { sqlChallenges, type SqlChallenge } from "./challenges";
import { generateExplorationMilestones } from "./explorationGenerator";
import { evaluateSqlQuery } from "./SqlTester";
import { Inspector } from "./Inspector";
import { SplitPane } from "@bridge/SplitPane";
import { LabSidebar, GithubIcon } from "@bridge/LabSidebar";
import type { TestResult } from "@bridge/types";
import seedSqlRaw from "./seed.sql?raw";
import northwindSqlRaw from "./presets/northwind.sql?raw";
import worldSqlRaw from "./presets/world.sql?raw";
import { CheatSheetView } from "./CheatSheetView";
import { ImportExportModal } from "./ImportExportModal";
import { TutorialTour } from "./TutorialTour";
import { DatabaseSwitcher } from "./DatabaseSwitcher";
import { format } from "sql-formatter";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  HelpCircle,
  Database,
  Layers,
  GraduationCap,
  ChevronDown,
  Menu,
  PanelLeft,
} from "lucide-react";
import { SqlCodeEditor } from "./SqlCodeEditor";

interface SchemaTable {
  name: string;
  columns: string[];
}

export const SqlApp: React.FC = () => {
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [dbName, setDbName] = useState("Sakila SQLite");
  const [schemaTables, setSchemaTables] = useState<SchemaTable[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const isDefaultSakila = useMemo(() => {
    return dbName.toLowerCase().includes("sakila");
  }, [dbName]);

  const dbKey = useMemo(() => {
    return dbName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  }, [dbName]);

  // Scoped custom challenges imported by user for the active database
  const [customChallenges, setCustomChallenges] = useState<SqlChallenge[]>(() => {
    try {
      const saved = localStorage.getItem("sakila_custom_challenges");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-load custom challenges when database changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sql_custom_${dbKey}`);
      if (saved) {
        setCustomChallenges(JSON.parse(saved));
      } else if (isDefaultSakila) {
        const legacy = localStorage.getItem("sakila_custom_challenges");
        setCustomChallenges(legacy ? JSON.parse(legacy) : []);
      } else {
        setCustomChallenges([]);
      }
    } catch {
      setCustomChallenges([]);
    }
  }, [dbKey, isDefaultSakila]);

  // Auto-synthesized exploration challenges for newly loaded custom database
  const explorationMilestones = useMemo(() => {
    if (isDefaultSakila) return [];
    return generateExplorationMilestones(schemaTables);
  }, [isDefaultSakila, schemaTables]);

  const allChallenges = useMemo(() => {
    if (isDefaultSakila) {
      return [...sqlChallenges, ...customChallenges];
    }
    return customChallenges.length > 0 ? customChallenges : explorationMilestones;
  }, [isDefaultSakila, customChallenges, explorationMilestones]);

  const [userQuery, setUserQuery] = useState(allChallenges[0]?.starterQuery || "");
  const [userRows, setUserRows] = useState<Record<string, any>[]>([]);
  const [userColumns, setUserColumns] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [executionMs, setExecutionMs] = useState(0);
  const [explainPlan, setExplainPlan] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showInspector, setShowInspector] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [appMode, setAppMode] = useState<"lab" | "cheatsheet">("lab");
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showTour, setShowTour] = useState(() => {
    try {
      return !localStorage.getItem("sql_studio_tutorial_completed");
    } catch {
      return false;
    }
  });
  const [showDbSwitcher, setShowDbSwitcher] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    try {
      return typeof window !== "undefined" && window.innerWidth < 768;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scoped completed milestones in localStorage
  const [completedMilestones, setCompletedMilestones] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sakila_completed_milestones");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-load completed milestones when database changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sql_progress_${dbKey}`);
      if (saved) {
        setCompletedMilestones(JSON.parse(saved));
      } else if (isDefaultSakila) {
        const legacy = localStorage.getItem("sakila_completed_milestones");
        setCompletedMilestones(legacy ? JSON.parse(legacy) : []);
      } else {
        setCompletedMilestones([]);
      }
    } catch {
      setCompletedMilestones([]);
    }
  }, [dbKey, isDefaultSakila]);

  useEffect(() => {
    try {
      localStorage.setItem(`sql_progress_${dbKey}`, JSON.stringify(completedMilestones));
      if (isDefaultSakila) {
        localStorage.setItem("sakila_completed_milestones", JSON.stringify(completedMilestones));
      }
    } catch (e) {
      console.warn("Could not save completed milestones to localStorage", e);
    }
  }, [completedMilestones, dbKey, isDefaultSakila]);

  useEffect(() => {
    try {
      localStorage.setItem(`sql_custom_${dbKey}`, JSON.stringify(customChallenges));
      if (isDefaultSakila) {
        localStorage.setItem("sakila_custom_challenges", JSON.stringify(customChallenges));
      }
    } catch (e) {
      console.warn("Could not save custom challenges to localStorage", e);
    }
  }, [customChallenges, dbKey, isDefaultSakila]);

  // Bounds guard if challenges length changes
  useEffect(() => {
    if (allChallenges.length > 0 && currentIdx >= allChallenges.length) {
      setCurrentIdx(0);
      setUserQuery(allChallenges[0]?.starterQuery || "");
    }
  }, [allChallenges.length, currentIdx]);

  const activeChallenge = (allChallenges[currentIdx] || allChallenges[0] || sqlChallenges[0]) ?? {
    id: "empty",
    title: "Milestone: Exploration",
    description: "Explore the active database using queries.",
    difficulty: "beginner" as const,
    hints: [],
    starterQuery: "",
    referenceSolution: "SELECT 1;",
  };

  // Dynamically extract schema tables from database
  const extractSchema = useCallback((database: SqlJsDatabase) => {
    try {
      const tablesRes = database.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
      );
      if (!tablesRes.length || !tablesRes[0].values) {
        setSchemaTables([]);
        return;
      }
      const tableNames = tablesRes[0].values.map((v) => String(v[0]));
      const tables: SchemaTable[] = [];

      for (const name of tableNames) {
        try {
          const colsRes = database.exec(`PRAGMA table_info("${name}");`);
          const columns = colsRes.length && colsRes[0].values
            ? colsRes[0].values.map((v) => String(v[1]))
            : [];
          tables.push({ name, columns });
        } catch {
          tables.push({ name, columns: [] });
        }
      }
      setSchemaTables(tables);
    } catch (err) {
      console.warn("Could not extract schema:", err);
      setSchemaTables([]);
    }
  }, []);

  // Initialize SQLite database with Sakila
  const initDefaultSakilaDb = useCallback(async () => {
    try {
      const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
      const instance = new SQL.Database();
      instance.run(seedSqlRaw);
      setDb(instance);
      setDbName("Sakila SQLite");
      extractSchema(instance);
    } catch (err) {
      console.error("Failed to load SQLite WASM:", err);
      setErrorMessage("Failed to load database engine");
    }
  }, [extractSchema]);

  useEffect(() => {
    initDefaultSakilaDb();
  }, [initDefaultSakilaDb]);

  // Handle custom database loading
  const handleLoadCustomDb = (newDb: SqlJsDatabase, name: string) => {
    setDb(newDb);
    setDbName(name);
    extractSchema(newDb);
    setUserRows([]);
    setUserColumns([]);
    setErrorMessage(null);
    setTestResults([]);
  };

  const handleResetDb = () => {
    initDefaultSakilaDb();
  };

  // Instant switching between preset practice databases
  const handleSelectPreset = useCallback(async (presetId: string) => {
    try {
      const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
      const instance = new SQL.Database();
      let name = "Sakila SQLite";

      if (presetId === "sakila") {
        instance.run(seedSqlRaw);
        name = "Sakila SQLite";
      } else if (presetId === "northwind") {
        instance.run(northwindSqlRaw);
        name = "Northwind SQLite";
      } else if (presetId === "world") {
        instance.run(worldSqlRaw);
        name = "World SQLite";
      }

      setDb(instance);
      setDbName(name);
      extractSchema(instance);
      setUserRows([]);
      setUserColumns([]);
      setErrorMessage(null);
      setTestResults([]);
      setCurrentIdx(0);
    } catch (err) {
      console.error("Failed to load preset database:", err);
      setErrorMessage("Failed to load preset database: " + String(err));
    }
  }, [extractSchema]);

  // Handle direct file upload from DatabaseSwitcher
  const handleUploadDbFile = useCallback(async (file: File) => {
    try {
      const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
      let instance: SqlJsDatabase;

      if (file.name.endsWith(".sql")) {
        const sqlText = await file.text();
        instance = new SQL.Database();
        instance.run(sqlText);
      } else {
        const buffer = await file.arrayBuffer();
        instance = new SQL.Database(new Uint8Array(buffer));
      }

      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      handleLoadCustomDb(instance, cleanName);
    } catch (err) {
      console.error("Failed to load custom db file:", err);
      setErrorMessage("Failed to load custom db file: " + String(err));
    }
  }, [handleLoadCustomDb]);

  // Real-time SQL syntax linter state
  const [lintStatus, setLintStatus] = useState<{
    valid: boolean | null;
    message?: string;
  }>({ valid: null });

  useEffect(() => {
    if (!db || !userQuery.trim()) {
      setLintStatus({ valid: null });
      return;
    }
    const timer = setTimeout(() => {
      try {
        db.exec(`EXPLAIN ${userQuery}`);
        setLintStatus({ valid: true, message: "Valid SQL syntax" });
      } catch (err: any) {
        setLintStatus({ valid: false, message: err.message || "Syntax error" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [userQuery, db]);

  // Prettier SQL Formatter handler
  const handleFormatQuery = () => {
    if (!userQuery.trim()) return;
    try {
      const formatted = format(userQuery, {
        language: "sqlite",
        keywordCase: "upper",
        linesBetweenQueries: 2,
      });
      setUserQuery(formatted);
    } catch (err) {
      console.warn("SQL formatter warning:", err);
    }
  };

  // Update query when challenge changes
  const handleSelectChallenge = (idx: number) => {
    setCurrentIdx(idx);
    setUserQuery(allChallenges[idx]?.starterQuery || "");
    setUserRows([]);
    setUserColumns([]);
    setErrorMessage(null);
    setTestResults([]);
    setShowHints(false);
  };

  const handleImportChallenges = (newChallenges: SqlChallenge[]) => {
    setCustomChallenges((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const filtered = newChallenges.filter((c) => !existingIds.has(c.id));
      return [...prev, ...filtered];
    });
  };

  const handleDeleteChallenge = (id: string) => {
    setCustomChallenges((prev) => prev.filter((c) => c.id !== id));
    if (activeChallenge.id === id) {
      setCurrentIdx(0);
    }
  };

  const handleClearCustomChallenges = () => {
    setCustomChallenges([]);
    setCurrentIdx(0);
  };

  const handleResetProgress = () => {
    localStorage.removeItem("sakila_completed_milestones");
    localStorage.removeItem("sakila_custom_challenges");
    setCompletedMilestones([]);
    setCustomChallenges([]);
    setCurrentIdx(0);
  };

  const runQuery = () => {
    if (!db) return;
    setErrorMessage(null);
    const start = performance.now();

    try {
      // 1. Run user query
      const res = db.exec(userQuery);
      const elapsed = performance.now() - start;
      setExecutionMs(elapsed);

      let rows: Record<string, any>[] = [];
      let cols: string[] = [];

      if (res.length > 0) {
        cols = res[0].columns;
        rows = res[0].values.map((v) => {
          const row: Record<string, any> = {};
          cols.forEach((col, i) => {
            row[col] = v[i];
          });
          return row;
        });
      }

      setUserColumns(cols);
      setUserRows(rows);

      // 2. Fetch EXPLAIN QUERY PLAN
      try {
        const planRes = db.exec(`EXPLAIN QUERY PLAN ${userQuery}`);
        if (planRes.length > 0) {
          setExplainPlan(
            planRes[0].values.map((v) => ({
              id: Number(v[0]),
              parent: Number(v[1]),
              notused: Number(v[2]),
              detail: String(v[3]),
            }))
          );
        }
      } catch {
        setExplainPlan([]);
      }

      // 3. Evaluate against reference query
      const refRes = db.exec(activeChallenge.referenceSolution);
      let refRows: Record<string, any>[] = [];
      if (refRes.length > 0) {
        const refCols = refRes[0].columns;
        refRows = refRes[0].values.map((v) => {
          const row: Record<string, any> = {};
          refCols.forEach((col, i) => {
            row[col] = v[i];
          });
          return row;
        });
      }

      const evaluation = evaluateSqlQuery(rows, refRows, {
        requireOrder: activeChallenge.requireOrder,
      });

      if (evaluation.passed) {
        setCompletedMilestones((prev) =>
          prev.includes(activeChallenge.id) ? prev : [...prev, activeChallenge.id]
        );
      }

      setTestResults([
        {
          id: `${activeChallenge.id}-result`,
          passed: evaluation.passed,
          message: evaluation.message,
        },
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || "SQL Error");
      setTestResults([
        {
          id: `${activeChallenge.id}-error`,
          passed: false,
          message: err.message || "Execution error",
        },
      ]);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <SplitPane
        direction="horizontal"
        initialSize={250}
        minSize={180}
        maxSize={400}
        primary="first"
        collapsed={isMobile}
        firstPane={
          <div data-tour="sidebar" className="h-full">
            <LabSidebar
              title="SQL Studio"
              subtitle={`${dbName} · ${allChallenges.length} Milestones`}
              milestones={allChallenges.map((c) => ({
                id: c.id,
                title: c.title,
                category: c.difficulty,
              }))}
              currentIndex={currentIdx}
              completedIds={completedMilestones}
              onSelect={handleSelectChallenge}
              githubUrl="https://github.com/BrianC0des/sakila-sql-lab"
            />
          </div>
        }
        secondPane={
          <div className="flex flex-col h-full w-full min-w-0">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-3 md:px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0 gap-2 overflow-x-auto">
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                {/* Mobile Milestones Drawer Toggle */}
                {isMobile && (
                  <button
                    onClick={() => setShowMobileSidebar(true)}
                    title="Open Milestones List"
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 hover:border-sky-500 transition flex items-center gap-1 text-xs font-semibold"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="text-[11px] font-mono">Milestones</span>
                  </button>
                )}

                <span className="font-bold text-sm tracking-tight text-sky-400 flex items-center gap-1.5 shrink-0">
                  <span className="text-amber-400">⚡</span> SQL Studio
                </span>

                {/* Mode Tabs (Lab & Cheat Sheet Only) */}
                <div className="flex rounded overflow-hidden border border-slate-700 font-medium">
                  <button
                    onClick={() => setAppMode("lab")}
                    className={`text-xs px-3 py-1 transition ${
                      appMode === "lab"
                        ? "bg-slate-700 text-slate-100 font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    💻 Lab
                  </button>
                  <button
                    data-tour="cheatsheet-tab"
                    onClick={() => setAppMode("cheatsheet")}
                    className={`text-xs px-3 py-1 transition border-l border-slate-700 ${
                      appMode === "cheatsheet"
                        ? "bg-slate-700 text-slate-100 font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    📖 Cheat Sheet
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Easy Database Switcher Button */}
                <button
                  data-tour="db-switcher-btn"
                  onClick={() => setShowDbSwitcher(true)}
                  title="Switch Database (Sakila, Northwind, World, or Upload Custom)"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-700/80 hover:border-sky-500 transition font-medium shadow-xs"
                >
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>Switch DB</span>
                  <span className="text-[10px] text-sky-300 font-mono bg-sky-900/60 px-1.5 py-0.2 rounded border border-sky-700/60 max-w-[90px] truncate">
                    {dbName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-sky-400" />
                </button>

                {/* Question Packs & AI Manager Button */}
                <button
                  data-tour="db-modal-btn"
                  onClick={() => setShowManagerModal(true)}
                  title="Import Local DB, Batch Import Questions, or Manage Questions"
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition font-medium"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden md:inline">Question Packs</span>
                </button>

                {appMode === "lab" && (
                  <>
                    <button
                      onClick={() => setShowInspector(!showInspector)}
                      className={`text-xs px-2.5 py-1 rounded transition border ${
                        showInspector
                          ? "bg-slate-800 text-sky-400 border-sky-600"
                          : "bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {showInspector ? "Hide Inspector" : "Show Inspector"}
                    </button>
                    <button
                      data-tour="run-btn"
                      onClick={runQuery}
                      className="text-xs px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 font-bold rounded text-white shadow-sm transition active:scale-95"
                    >
                      Run Query (Ctrl+Enter)
                    </button>
                  </>
                )}

                {/* Tour Replay Button */}
                <button
                  onClick={() => setShowTour(true)}
                  title="Take a Tour"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:border-amber-600 transition font-medium"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Tour
                </button>

                {/* GitHub Source Code */}
                <a
                  href="https://github.com/BrianC0des/sakila-sql-lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Source Code on GitHub"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition font-medium"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </div>
            </header>

            {/* Main Content Area */}
            {appMode === "cheatsheet" ? (
              <div className="flex-1 min-h-0 overflow-hidden bg-slate-950">
                <CheatSheetView activeDbName={dbName} schemaTables={schemaTables} />
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Challenge Instructions */}
                <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                        {activeChallenge.title.split(":")[0]}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {activeChallenge.difficulty}
                      </span>
                      {activeChallenge.isCustom && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                          Custom
                        </span>
                      )}
                      {completedMilestones.includes(activeChallenge.id) && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                          ✓ Passed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {activeChallenge.isCustom && (
                        <button
                          onClick={() => handleDeleteChallenge(activeChallenge.id)}
                          title="Delete this custom question"
                          className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-850 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Question
                        </button>
                      )}

                      {activeChallenge.hints && activeChallenge.hints.length > 0 && (
                        <button
                          onClick={() => setShowHints(!showHints)}
                          className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 px-2.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/60 transition"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>{showHints ? "Hide Hints" : `Hints (${activeChallenge.hints.length})`}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 mt-1">
                    {activeChallenge.title.split(":")[1]?.trim() || activeChallenge.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {activeChallenge.description}
                  </p>

                  {/* Inline Collapsible Hints */}
                  {showHints && activeChallenge.hints && activeChallenge.hints.length > 0 && (
                    <div className="mt-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-850 space-y-1.5 text-xs">
                      <div className="font-semibold text-amber-300 text-[11px]">💡 Hints:</div>
                      {activeChallenge.hints.map((hint, hIdx) => (
                        <div key={hIdx} className="text-slate-300 flex items-start gap-1.5 leading-relaxed text-[11px]">
                          <span className="text-amber-400 font-bold">{hIdx + 1}.</span>
                          <span>{hint}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Query Editor & Result Resizable Split */}
                <div className="flex-1 min-h-0 w-full">
                  <SplitPane
                    direction="vertical"
                    initialSize={220}
                    minSize={120}
                    maxSize={600}
                    primary="first"
                    firstPane={
                      <div className="h-full w-full bg-slate-950 flex flex-col min-h-0">
                        {/* Editor Toolbar */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 shrink-0 text-xs select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                              SQL Editor
                            </span>

                            {/* Real-time Syntax Linting Badge */}
                            {lintStatus.valid === true && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Valid Syntax
                              </span>
                            )}
                            {lintStatus.valid === false && (
                              <span
                                title={lintStatus.message}
                                className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 border border-rose-700/80 text-rose-300 max-w-xs truncate cursor-help shrink-0"
                              >
                                <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                                <span className="truncate">{lintStatus.message}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={handleFormatQuery}
                              title="Format SQL (Prettier) — Shift+Alt+F or Ctrl+Shift+F"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-slate-600 transition font-mono text-[10px] font-medium active:scale-95"
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              Format SQL
                            </button>
                            <button
                              onClick={() => setUserQuery("")}
                              title="Clear Editor"
                              className="inline-flex items-center gap-1 px-1.5 py-1 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-slate-700 transition text-[10px]"
                            >
                              <Trash2 className="w-3 h-3" />
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* SQL Syntax Highlighted Editor */}
                        <div data-tour="editor" className="flex-1 p-2.5 min-h-0 bg-slate-950">
                          <SqlCodeEditor
                            value={userQuery}
                            onChange={setUserQuery}
                            onRun={runQuery}
                            onFormat={handleFormatQuery}
                            placeholder="Write your SQL query from scratch here... (Shift+Alt+F to format, Ctrl+Enter to run)"
                          />
                        </div>
                      </div>
                    }
                    secondPane={
                      showInspector ? (
                        <SplitPane
                          direction="vertical"
                          initialSize={200}
                          minSize={120}
                          maxSize={400}
                          primary="second"
                          firstPane={
                            <div className="flex-1 p-3 overflow-auto h-full w-full min-h-0 bg-slate-925">
                              {testResults.length > 0 && (
                                testResults[0].passed ? (
                                  <div className="p-2.5 mb-2.5 rounded bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                      All assertions passed! Milestone completed.
                                    </span>
                                    {currentIdx < allChallenges.length - 1 && (
                                      <button
                                        onClick={() => handleSelectChallenge(currentIdx + 1)}
                                        className="px-2.5 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-mono text-[11px] transition shadow-sm"
                                      >
                                        Next Milestone →
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="p-2.5 mb-2.5 rounded bg-amber-950/60 border border-amber-700/80 text-amber-200 text-xs">
                                    <strong>Assertion Failed:</strong> {testResults[0].message}
                                  </div>
                                )
                              )}
                              {errorMessage ? (
                                <div className="p-4 rounded bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono">
                                  <strong>SQL Syntax Error:</strong> {errorMessage}
                                </div>
                              ) : userRows.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-xs text-slate-500">
                                  Press "Run Query" or Ctrl+Enter to execute.
                                </div>
                              ) : (
                                <div className="border border-slate-800 rounded overflow-hidden">
                                  <table className="w-full text-xs font-mono border-collapse text-left">
                                    <thead>
                                      <tr className="bg-slate-800 text-slate-300 border-b border-slate-700">
                                        {userColumns.map((col) => (
                                          <th key={col} className="p-2 border-r border-slate-700 last:border-r-0">
                                            {col}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {userRows.map((row, rIdx) => (
                                        <tr key={rIdx} className="border-b border-slate-800 hover:bg-slate-850/50">
                                          {userColumns.map((col) => (
                                            <td key={col} className="p-2 border-r border-slate-800 last:border-r-0 text-slate-200">
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
                              )}
                            </div>
                          }
                          secondPane={
                            <div className="h-full w-full border-t border-slate-800 overflow-hidden">
                              <Inspector
                                executionMs={executionMs}
                                rowCount={userRows.length}
                                explainPlan={explainPlan}
                                schemaTables={schemaTables}
                              />
                            </div>
                          }
                        />
                      ) : (
                        <div className="flex-1 p-3 overflow-auto h-full w-full min-h-0 bg-slate-925">
                          {testResults.length > 0 && (
                            testResults[0].passed ? (
                              <div className="p-2.5 mb-2.5 rounded bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  All assertions passed! Milestone completed.
                                </span>
                                {currentIdx < allChallenges.length - 1 && (
                                  <button
                                    onClick={() => handleSelectChallenge(currentIdx + 1)}
                                    className="px-2.5 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-mono text-[11px] transition shadow-sm"
                                  >
                                    Next Milestone →
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="p-2.5 mb-2.5 rounded bg-amber-950/60 border border-amber-700/80 text-amber-200 text-xs">
                                <strong>Assertion Failed:</strong> {testResults[0].message}
                              </div>
                            )
                          )}
                          {errorMessage ? (
                            <div className="p-4 rounded bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono">
                              <strong>SQL Syntax Error:</strong> {errorMessage}
                            </div>
                          ) : userRows.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-xs text-slate-500">
                              Press "Run Query" or Ctrl+Enter to execute.
                            </div>
                          ) : (
                            <div className="border border-slate-800 rounded overflow-hidden">
                              <table className="w-full text-xs font-mono border-collapse text-left">
                                <thead>
                                  <tr className="bg-slate-800 text-slate-300 border-b border-slate-700">
                                    {userColumns.map((col) => (
                                      <th key={col} className="p-2 border-r border-slate-700 last:border-r-0">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {userRows.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-slate-800 hover:bg-slate-850/50">
                                      {userColumns.map((col) => (
                                        <td key={col} className="p-2 border-r border-slate-800 last:border-r-0 text-slate-200">
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
                          )}
                        </div>
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* Database & Batch Question Manager Modal */}
      <ImportExportModal
        isOpen={showManagerModal}
        onClose={() => setShowManagerModal(false)}
        db={db}
        activeDbName={dbName}
        onLoadCustomDb={handleLoadCustomDb}
        onResetDb={handleResetDb}
        schemaTables={schemaTables}
        customChallenges={customChallenges}
        onImportChallenges={handleImportChallenges}
        onDeleteChallenge={handleDeleteChallenge}
        onClearCustomChallenges={handleClearCustomChallenges}
        completedMilestones={completedMilestones}
        onResetProgress={handleResetProgress}
      />

      {/* Easy Database Switcher Modal */}
      <DatabaseSwitcher
        isOpen={showDbSwitcher}
        onClose={() => setShowDbSwitcher(false)}
        activeDbName={dbName}
        onSelectPreset={handleSelectPreset}
        onUploadFile={handleUploadDbFile}
        onOpenManagerModal={() => setShowManagerModal(true)}
      />

      {/* Mobile Off-Canvas Sidebar Drawer */}
      {isMobile && showMobileSidebar && (
        <div className="fixed inset-0 z-40 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative w-[300px] max-w-[85vw] h-full bg-slate-900 z-50 shadow-2xl flex flex-col border-r border-slate-800">
            <LabSidebar
              title="SQL Studio"
              subtitle={`${dbName} · ${allChallenges.length} Milestones`}
              milestones={allChallenges.map((c) => ({
                id: c.id,
                title: c.title,
                category: c.difficulty,
              }))}
              currentIndex={currentIdx}
              completedIds={completedMilestones}
              onSelect={(idx) => {
                handleSelectChallenge(idx);
                setShowMobileSidebar(false);
              }}
              githubUrl="https://github.com/BrianC0des/sakila-sql-lab"
            />
          </div>
        </div>
      )}

      {/* Tutorial Tour Overlay */}
      <TutorialTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </div>
  );
};
