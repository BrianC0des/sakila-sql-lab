import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Zap,
  Terminal,
  BookOpen,
  Lightbulb,
  Check,
  GitFork,
  Clock,
  History,
  RefreshCw,
  Settings,
  Table2,
  Play,
} from "lucide-react";
import { SqlCodeEditor } from "./SqlCodeEditor";
import { ErdModal } from "./ErdModal";
import { QueryHistoryModal, type QueryHistoryItem } from "./QueryHistoryModal";
import { ResultTableViewer } from "./ResultTableViewer";
import { useUpdateChecker, UpdateNotifier } from "./UpdateNotifier";

export interface SchemaColumn {
  name: string;
  type?: string;
  isPk?: boolean;
  notNull?: boolean;
}

export interface SchemaTable {
  name: string;
  columns: string[];
  columnDetails?: SchemaColumn[];
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
      if (saved) {
        const parsed: SqlChallenge[] = JSON.parse(saved);
        const seenIds = new Set<string>();
        return parsed.map((c, i) => {
          let id = c.id;
          if (!id || seenIds.has(id)) {
            id = `custom-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
          }
          seenIds.add(id);
          const rawDiff = String(c.difficulty || "").toLowerCase().trim();
          const difficulty = rawDiff === "beginner" || rawDiff === "advanced" ? rawDiff : "intermediate";
          return {
            ...c,
            id,
            difficulty,
            isCustom: true,
            tags: Array.from(new Set([...(c.tags || []), "custom"].map((t) => String(t).toLowerCase().trim()))),
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  });

  // Re-load custom challenges when database changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sql_custom_${dbKey}`);
      if (saved) {
        const parsed: SqlChallenge[] = JSON.parse(saved);
        const seenIds = new Set<string>();
        setCustomChallenges(
          parsed.map((c, i) => {
            let id = c.id;
            if (!id || seenIds.has(id)) {
              id = `custom-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
            }
            seenIds.add(id);
            const rawDiff = String(c.difficulty || "").toLowerCase().trim();
            const difficulty = rawDiff === "beginner" || rawDiff === "advanced" ? rawDiff : "intermediate";
            return {
              ...c,
              id,
              difficulty,
              isCustom: true,
              tags: Array.from(new Set([...(c.tags || []), "custom"].map((t) => String(t).toLowerCase().trim()))),
            };
          })
        );
      } else if (isDefaultSakila) {
        const legacy = localStorage.getItem("sakila_custom_challenges");
        if (legacy) {
          const parsed: SqlChallenge[] = JSON.parse(legacy);
          const seenIds = new Set<string>();
          setCustomChallenges(
            parsed.map((c, i) => {
              let id = c.id;
              if (!id || seenIds.has(id)) {
                id = `custom-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
              }
              seenIds.add(id);
              const rawDiff = String(c.difficulty || "").toLowerCase().trim();
              const difficulty = rawDiff === "beginner" || rawDiff === "advanced" ? rawDiff : "intermediate";
              return {
                ...c,
                id,
                difficulty,
                isCustom: true,
                tags: Array.from(new Set([...(c.tags || []), "custom"].map((t) => String(t).toLowerCase().trim()))),
              };
            })
          );
        } else {
          setCustomChallenges([]);
        }
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

  const customChallengeIds = useMemo(() => new Set(customChallenges.map((c) => c.id)), [customChallenges]);

  const sidebarMilestones: LabMilestone[] = useMemo(() => {
    return allChallenges.map((c) => {
      const isCustom = Boolean(c.isCustom || customChallengeIds.has(c.id));
      const rawDiff = String(c.difficulty || "").toLowerCase().trim();
      const difficulty = rawDiff === "beginner" || rawDiff === "advanced" ? rawDiff : "intermediate";
      const tags = c.tags ? [...c.tags] : [];
      if (isCustom && !tags.some((t) => t.toLowerCase() === "custom")) {
        tags.push("custom");
      }
      return {
        id: c.id,
        title: c.title,
        category: difficulty,
        difficulty,
        tags,
        isCustom,
      };
    });
  }, [allChallenges, customChallengeIds]);

  const [userQuery, setUserQuery] = useState(allChallenges[0]?.starterQuery || "");
  const [userRows, setUserRows] = useState<Record<string, any>[]>([]);
  const [userColumns, setUserColumns] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [executionMs, setExecutionMs] = useState(0);
  const [explainPlan, setExplainPlan] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showInspector, setShowInspector] = useState(false);
  const [isInspectorMaximized, setIsInspectorMaximized] = useState(false);
  const [inspectorHeight, setInspectorHeight] = useState(260);

  const handleToggleMaximizeInspector = useCallback(() => {
    setIsInspectorMaximized((prev) => {
      const next = !prev;
      setInspectorHeight(
        next
          ? typeof window !== "undefined"
            ? Math.round(window.innerHeight * 0.75)
            : 580
          : 260
      );
      return next;
    });
  }, []);
  const [showHints, setShowHints] = useState(false);
  const [appMode, setAppMode] = useState<"lab" | "cheatsheet">("lab");
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerModalTab, setManagerModalTab] = useState<"database" | "import" | "manage" | "prompt" | "export">("prompt");
  const handleOpenAddBatch = useCallback(() => {
    setManagerModalTab("prompt");
    setShowManagerModal(true);
  }, []);
  const [showTour, setShowTour] = useState(() => {
    try {
      return !localStorage.getItem("sql_studio_tutorial_completed");
    } catch {
      return false;
    }
  });
  const [showDbSwitcher, setShowDbSwitcher] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [filterCustomChallenges, setFilterCustomChallenges] = useState<boolean>(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const { hasUpdate, checkForUpdates } = useUpdateChecker();
  const [expectedColumns, setExpectedColumns] = useState<string[]>([]);
  const [expectedRows, setExpectedRows] = useState<Record<string, any>[]>([]);
  const [resultTab, setResultTab] = useState<"user" | "expected" | "diff">("user");
  const [showErdModal, setShowErdModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    try {
      return typeof window !== "undefined" && window.innerWidth < 768;
    } catch {
      return false;
    }
  });

  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };
    if (isSettingsMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSettingsMenuOpen]);

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

  // Query Execution History
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`sql_history_${dbKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sql_history_${dbKey}`);
      setQueryHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setQueryHistory([]);
    }
  }, [dbKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`sql_history_${dbKey}`, JSON.stringify(queryHistory.slice(0, 50)));
    } catch (e) {
      console.warn("Could not save query history", e);
    }
  }, [queryHistory, dbKey]);

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
          const columns: string[] = [];
          const columnDetails: SchemaColumn[] = [];
          if (colsRes.length && colsRes[0].values) {
            for (const v of colsRes[0].values) {
              const colName = String(v[1]);
              const colType = String(v[2] || "TEXT");
              const notNull = Number(v[3]) === 1;
              const isPk = Number(v[5]) > 0;
              columns.push(colName);
              columnDetails.push({ name: colName, type: colType, notNull, isPk });
            }
          }
          tables.push({ name, columns, columnDetails });
        } catch {
          tables.push({ name, columns: [], columnDetails: [] });
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
    if (idx < 0 || idx >= allChallenges.length) return;
    const challenge = allChallenges[idx];
    if (
      activeCategoryFilter !== "all" &&
      challenge?.difficulty &&
      challenge.difficulty.toLowerCase() !== activeCategoryFilter.toLowerCase()
    ) {
      setActiveCategoryFilter(challenge.difficulty.toLowerCase());
    }
    setCurrentIdx(idx);
    let queryToSet = challenge?.starterQuery || "";
    try {
      const saved = localStorage.getItem(`sql_studio_query_${challenge?.id}`);
      if (saved !== null && saved !== undefined) queryToSet = saved;
    } catch {}
    setUserQuery(queryToSet);
    setUserRows([]);
    setUserColumns([]);
    setExpectedRows([]);
    setExpectedColumns([]);
    setResultTab("user");
    setErrorMessage(null);
    setTestResults([]);
    setShowHints(false);
  };

  // Auto-save active challenge query so refreshing or updating never loses user work
  useEffect(() => {
    if (!activeChallenge?.id) return;
    try {
      localStorage.setItem(`sql_studio_query_${activeChallenge.id}`, userQuery);
    } catch {}
  }, [userQuery, activeChallenge?.id]);

  const nextMilestone = useMemo(() => {
    if (activeCategoryFilter !== "all") {
      // 1. Look for next milestone with the same difficulty after currentIdx
      for (let i = currentIdx + 1; i < allChallenges.length; i++) {
        if ((allChallenges[i].difficulty || "").toLowerCase() === activeCategoryFilter.toLowerCase()) {
          const catName = allChallenges[i].difficulty.charAt(0).toUpperCase() + allChallenges[i].difficulty.slice(1);
          return {
            targetIdx: i,
            label: `Next ${catName} Milestone →`,
            nextCategory: activeCategoryFilter,
          };
        }
      }

      // 2. Look for any earlier uncompleted milestone in this category
      for (let i = 0; i < currentIdx; i++) {
        if (
          (allChallenges[i].difficulty || "").toLowerCase() === activeCategoryFilter.toLowerCase() &&
          !completedMilestones.includes(allChallenges[i].id)
        ) {
          const catName = allChallenges[i].difficulty.charAt(0).toUpperCase() + allChallenges[i].difficulty.slice(1);
          return {
            targetIdx: i,
            label: `Next Unfinished ${catName} Milestone →`,
            nextCategory: activeCategoryFilter,
          };
        }
      }

      // 3. All milestones in this difficulty tier completed! Offer advancing to next tier
      const progression = ["beginner", "intermediate", "advanced"];
      const currentTierIdx = progression.indexOf(activeCategoryFilter.toLowerCase());
      if (currentTierIdx !== -1 && currentTierIdx < progression.length - 1) {
        const nextTier = progression[currentTierIdx + 1];
        const nextTierFirstIdx = allChallenges.findIndex(
          (c) => (c.difficulty || "").toLowerCase() === nextTier
        );
        if (nextTierFirstIdx !== -1) {
          const currentName = activeCategoryFilter.charAt(0).toUpperCase() + activeCategoryFilter.slice(1);
          const nextName = nextTier.charAt(0).toUpperCase() + nextTier.slice(1);
          return {
            targetIdx: nextTierFirstIdx,
            label: `All ${currentName} Done! Advance to ${nextName} →`,
            nextCategory: nextTier,
          };
        }
      }

      return null;
    }

    // activeCategoryFilter === "all"
    if (currentIdx < allChallenges.length - 1) {
      const nextChallenge = allChallenges[currentIdx + 1];
      return {
        targetIdx: currentIdx + 1,
        label: `Next Milestone (${nextChallenge.title.split(":")[0]}) →`,
        nextCategory: "all",
      };
    }

    return null;
  }, [allChallenges, currentIdx, activeCategoryFilter, completedMilestones]);

  const handleAdvanceMilestone = () => {
    if (!nextMilestone) return;
    if (nextMilestone.nextCategory && nextMilestone.nextCategory !== activeCategoryFilter) {
      setActiveCategoryFilter(nextMilestone.nextCategory);
    }
    handleSelectChallenge(nextMilestone.targetIdx);
  };

  const handleImportChallenges = (newChallenges: SqlChallenge[]) => {
    setCustomChallenges((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const taggedNew = newChallenges.map((c, i) => {
        let id = c.id;
        if (!id || existingIds.has(id)) {
          id = `custom-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
        }
        existingIds.add(id);

        const rawDiff = String(c.difficulty || "").toLowerCase().trim();
        const difficulty = rawDiff === "beginner" || rawDiff === "advanced" ? rawDiff : "intermediate";

        return {
          ...c,
          id,
          difficulty,
          isCustom: true,
          tags: Array.from(new Set([...(c.tags || []), "custom"].map((t) => String(t).toLowerCase().trim()))),
        };
      });
      return [...prev, ...taggedNew];
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
      let refCols: string[] = [];
      if (refRes.length > 0) {
        refCols = refRes[0].columns;
        refRows = refRes[0].values.map((v) => {
          const row: Record<string, any> = {};
          refCols.forEach((col, i) => {
            row[col] = v[i];
          });
          return row;
        });
      }

      setExpectedColumns(refCols);
      setExpectedRows(refRows);

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

      // Record to history
      const historyItem: QueryHistoryItem = {
        id: `qh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        query: userQuery,
        timestamp: Date.now(),
        durationMs: elapsed,
        rowCount: rows.length,
        passed: evaluation.passed,
        challengeTitle: activeChallenge.title,
      };
      setQueryHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
    } catch (err: any) {
      setErrorMessage(err.message || "SQL Error");
      setTestResults([
        {
          id: `${activeChallenge.id}-error`,
          passed: false,
          message: err.message || "Execution error",
        },
      ]);
      const historyItem: QueryHistoryItem = {
        id: `qh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        query: userQuery,
        timestamp: Date.now(),
        durationMs: performance.now() - start,
        rowCount: 0,
        passed: false,
        challengeTitle: activeChallenge.title,
      };
      setQueryHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
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
              milestones={sidebarMilestones}
              currentIndex={currentIdx}
              completedIds={completedMilestones}
              onSelect={handleSelectChallenge}
              githubUrl="https://github.com/BrianC0des/sakila-sql-lab"
              activeFilter={activeCategoryFilter}
              onFilterChange={setActiveCategoryFilter}
              filterCustom={filterCustomChallenges}
              onFilterCustomChange={setFilterCustomChallenges}
              activeTags={activeTags}
              onTagsChange={setActiveTags}
              onAddBatch={handleOpenAddBatch}
            />
          </div>
        }
        secondPane={
          <div className="flex flex-col h-full w-full min-w-0">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-3 md:px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0 gap-3">
              {/* Left Group: Logo, DB Context Breadcrumb, and Mode Switcher */}
              <div className="flex items-center gap-2 md:gap-3 shrink-0 min-w-0">
                {/* Mobile Milestones Drawer Toggle */}
                {isMobile && (
                  <button
                    onClick={() => setShowMobileSidebar(true)}
                    title="Open Milestones List"
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 hover:border-sky-500 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="text-[11px] font-mono hidden sm:inline">Milestones</span>
                  </button>
                )}

                {/* Brand Logo */}
                <span className="font-bold text-sm tracking-tight text-sky-400 flex items-center gap-1.5 shrink-0">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span className="hidden sm:inline">SQL Studio</span>
                </span>

                <span className="text-slate-600 select-none font-thin text-xs hidden sm:inline">/</span>

                {/* Database Breadcrumb Switcher */}
                <button
                  data-tour="db-switcher-btn"
                  onClick={() => setShowDbSwitcher(true)}
                  title="Switch Database (Sakila, Northwind, World, or Upload Custom)"
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs px-2 sm:px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition font-medium shadow-xs cursor-pointer max-w-[120px] sm:max-w-[200px]"
                >
                  <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="font-mono text-slate-100 text-[11px] truncate">{dbName}</span>
                  <span className="text-[10px] text-slate-400 hidden md:inline font-sans shrink-0">({schemaTables.length} tables)</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Mode Tabs (Lab & Cheat Sheet Only) */}
                <div className="flex rounded overflow-hidden border border-slate-700 font-medium ml-0.5 shrink-0">
                  <button
                    onClick={() => setAppMode("lab")}
                    title="Interactive SQL Practice Lab"
                    className={`inline-flex items-center gap-1 text-xs px-2 sm:px-2.5 py-1 transition cursor-pointer ${
                      appMode === "lab"
                        ? "bg-slate-700 text-slate-100 font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">Lab</span>
                  </button>
                  <button
                    data-tour="cheatsheet-tab"
                    onClick={() => setAppMode("cheatsheet")}
                    title="Query Architecture Cheat Sheet"
                    className={`inline-flex items-center gap-1 text-xs px-2 sm:px-2.5 py-1 transition border-l border-slate-700 cursor-pointer ${
                      appMode === "cheatsheet"
                        ? "bg-slate-700 text-slate-100 font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Cheat Sheet</span>
                  </button>
                </div>
              </div>

              {/* Right Group: 1-Click Workbench Tools & Clean Utility Popover */}
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                {/* 1-Click Visible Table Schema Inspector */}
                {appMode === "lab" && (
                  <button
                    data-test="inspector-toggle-btn"
                    onClick={() => setShowInspector(!showInspector)}
                    title={showInspector ? "Hide Table Schema & Data Inspector" : "Show Table Schema & Data Inspector"}
                    className={`inline-flex items-center gap-1.5 text-xs px-2 sm:px-2.5 py-1 rounded transition border font-medium cursor-pointer ${
                      showInspector
                        ? "bg-sky-950 text-sky-300 border-sky-600 shadow-xs"
                        : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Table2 className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">Inspector</span>
                  </button>
                )}

                {/* Settings & Tools Popover */}
                <div className="relative shrink-0" ref={settingsMenuRef}>
                  <button
                    data-tour="settings-btn"
                    data-test="settings-menu-btn"
                    onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                    title="Tools, ERD Map, Question Packs, and Tour"
                    className={`p-1.5 rounded transition border cursor-pointer ${
                      isSettingsMenuOpen
                        ? "bg-slate-700 text-white border-slate-500"
                        : "bg-slate-800/90 text-slate-400 hover:text-slate-200 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  {isSettingsMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs text-slate-300 divide-y divide-slate-800/80 animate-in fade-in zoom-in-95 duration-150">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsSettingsMenuOpen(false);
                            setShowErdModal(true);
                          }}
                          className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition cursor-pointer group"
                        >
                          <GitFork className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="leading-tight">
                            <div className="font-medium text-slate-200 group-hover:text-white">ERD Relationship Map</div>
                            <div className="text-[10px] text-slate-500">Visual table relations & schemas</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setIsSettingsMenuOpen(false);
                            setManagerModalTab("import");
                            setShowManagerModal(true);
                          }}
                          className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition cursor-pointer group"
                        >
                          <Layers className="w-4 h-4 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="leading-tight">
                            <div className="font-medium text-slate-200 group-hover:text-white">Curriculum & Question Packs</div>
                            <div className="text-[10px] text-slate-500">Batch import, AI prompts & custom DB</div>
                          </div>
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsSettingsMenuOpen(false);
                            setShowTour(true);
                          }}
                          className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        >
                          <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Interactive Tour</span>
                        </button>
                        <a
                          href="https://github.com/BrianC0des/sakila-sql-lab"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        >
                          <GithubIcon className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>GitHub Repository</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
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
                        {activeChallenge.difficulty && activeChallenge.difficulty !== "custom" ? activeChallenge.difficulty : "intermediate"}
                      </span>
                      {(activeChallenge.isCustom || customChallengeIds.has(activeChallenge.id)) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 shadow-xs">
                          <span>★</span>
                          <span>Custom Question</span>
                        </span>
                      )}
                      {completedMilestones.includes(activeChallenge.id) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Passed</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {(activeChallenge.isCustom || customChallengeIds.has(activeChallenge.id)) && (
                        <button
                          onClick={() => handleDeleteChallenge(activeChallenge.id)}
                          title="Delete this custom question"
                          className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-850 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Question
                        </button>
                      )}

                      {activeChallenge.hints && activeChallenge.hints.length > 0 && (
                        <button
                          onClick={() => setShowHints(!showHints)}
                          className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 px-2.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/60 transition cursor-pointer"
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

                  {/* Interactive Topic Tags */}
                  {(() => {
                    const isCustomQ = Boolean(activeChallenge.isCustom || customChallengeIds.has(activeChallenge.id));
                    const challengeTags = activeChallenge.tags ? [...activeChallenge.tags] : [];
                    if (isCustomQ && !challengeTags.some((t) => t.toLowerCase() === "custom")) {
                      challengeTags.push("custom");
                    }
                    if (challengeTags.length === 0) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] text-slate-500 font-mono">Topics:</span>
                        {challengeTags.map((t) => {
                          const isTagSelected = activeTags.includes(t.toLowerCase());
                          const isCustomTag = t.toLowerCase() === "custom";
                          return (
                            <button
                              key={t}
                              onClick={() => {
                                setActiveTags((prev) =>
                                  prev.includes(t.toLowerCase())
                                    ? prev.filter((tag) => tag !== t.toLowerCase())
                                    : [...prev, t.toLowerCase()]
                                );
                              }}
                              title={`Toggle filter for topic #${t}`}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                                isTagSelected
                                  ? "bg-purple-900 text-purple-200 border border-purple-500 font-bold shadow-xs"
                                  : isCustomTag
                                  ? "bg-purple-950/80 text-purple-300 border border-purple-800/80 hover:bg-purple-900/60 font-semibold"
                                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700"
                              }`}
                            >
                              {isCustomTag && <span>★</span>}
                              <span>#{t}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Inline Collapsible Hints */}
                  {showHints && activeChallenge.hints && activeChallenge.hints.length > 0 && (
                    <div className="mt-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-850 space-y-1.5 text-xs">
                      <div className="font-semibold text-amber-300 text-[11px] flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hints:</span>
                      </div>
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

                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            <button
                              onClick={handleFormatQuery}
                              title="Format SQL (Prettier) — Shift+Alt+F or Ctrl+Shift+F"
                              className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-slate-600 transition font-mono text-[10px] font-medium active:scale-95"
                            >
                              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="hidden sm:inline">Format SQL</span>
                            </button>
                            <button
                              onClick={() => setShowHistoryModal(true)}
                              title="View SQL Execution History"
                              className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-slate-600 transition font-mono text-[10px] font-medium active:scale-95"
                            >
                              <History className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="hidden sm:inline">History</span>
                              {queryHistory.length > 0 && (
                                <span className="text-[9px] px-1 rounded-full bg-slate-900 text-amber-300 border border-amber-800/60 font-mono">
                                  {queryHistory.length}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => setUserQuery("")}
                              title="Clear Editor"
                              className="inline-flex items-center gap-1 px-1.5 py-1 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-slate-700 transition text-[10px] cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3 shrink-0" />
                              <span className="hidden sm:inline">Clear</span>
                            </button>
                            <button
                              data-tour="run-btn"
                              onClick={runQuery}
                              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-xs transition active:scale-95 text-[11px] cursor-pointer ml-0.5 sm:ml-1 shrink-0"
                            >
                              <Play className="w-3 h-3 fill-white shrink-0" />
                              <span>Run<span className="hidden sm:inline"> Query (Ctrl+Enter)</span></span>
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
                          initialSize={inspectorHeight}
                          minSize={120}
                          maxSize={typeof window !== "undefined" ? Math.round(window.innerHeight * 0.85) : 800}
                          primary="second"
                          firstPane={
                            <ResultTableViewer
                              userColumns={userColumns}
                              userRows={userRows}
                              expectedColumns={expectedColumns}
                              expectedRows={expectedRows}
                              testResults={testResults}
                              errorMessage={errorMessage}
                              nextMilestone={nextMilestone}
                              onAdvanceMilestone={handleAdvanceMilestone}
                              resultTab={resultTab}
                              onResultTabChange={setResultTab}
                            />
                          }
                          secondPane={
                            <div className="h-full w-full border-t border-slate-800 overflow-hidden">
                              <Inspector
                                executionMs={executionMs}
                                rowCount={userRows.length}
                                explainPlan={explainPlan}
                                schemaTables={schemaTables}
                                isMaximized={isInspectorMaximized}
                                onToggleMaximize={handleToggleMaximizeInspector}
                                onClose={() => setShowInspector(false)}
                              />
                            </div>
                          }
                        />
                      ) : (
                        <ResultTableViewer
                          userColumns={userColumns}
                          userRows={userRows}
                          expectedColumns={expectedColumns}
                          expectedRows={expectedRows}
                          testResults={testResults}
                          errorMessage={errorMessage}
                          nextMilestone={nextMilestone}
                          onAdvanceMilestone={handleAdvanceMilestone}
                          resultTab={resultTab}
                          onResultTabChange={setResultTab}
                        />
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
        initialTab={managerModalTab}
      />

      {/* Easy Database Switcher Modal */}
      <DatabaseSwitcher
        isOpen={showDbSwitcher}
        onClose={() => setShowDbSwitcher(false)}
        activeDbName={dbName}
        onSelectPreset={handleSelectPreset}
        onUploadFile={handleUploadDbFile}
        onOpenManagerModal={() => {
          setManagerModalTab("database");
          setShowManagerModal(true);
        }}
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
              milestones={sidebarMilestones}
              currentIndex={currentIdx}
              completedIds={completedMilestones}
              onSelect={(idx) => {
                handleSelectChallenge(idx);
                setShowMobileSidebar(false);
              }}
              githubUrl="https://github.com/BrianC0des/sakila-sql-lab"
              activeFilter={activeCategoryFilter}
              onFilterChange={setActiveCategoryFilter}
              filterCustom={filterCustomChallenges}
              onFilterCustomChange={setFilterCustomChallenges}
              activeTags={activeTags}
              onTagsChange={setActiveTags}
              onAddBatch={() => {
                setShowMobileSidebar(false);
                handleOpenAddBatch();
              }}
            />
          </div>
        </div>
      )}

      {/* Visual ERD & Schema Map Modal */}
      <ErdModal
        isOpen={showErdModal}
        onClose={() => setShowErdModal(false)}
        db={db}
        activeDbName={dbName}
        onInsertSnippet={(snippet) => setUserQuery((prev) => (prev ? `${prev} ${snippet}` : snippet))}
      />

      {/* Query Execution History Modal */}
      <QueryHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={queryHistory}
        onRestoreQuery={(q) => setUserQuery(q)}
        onClearHistory={() => setQueryHistory([])}
      />

      {/* Tutorial Tour Overlay */}
      <TutorialTour isOpen={showTour} onClose={() => setShowTour(false)} />

      {/* Live Website Update Notifier */}
      <UpdateNotifier hasUpdate={hasUpdate} onRefresh={() => window.location.reload()} />
    </div>
  );
};
