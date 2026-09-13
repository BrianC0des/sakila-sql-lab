import React, { useRef } from "react";
import { Database, CheckCircle2, Upload, Sparkles, X, ChevronRight, Layers, FileCode } from "lucide-react";

export interface DatabasePreset {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  tables: string[];
  totalQuestions: string;
}

export const PRESET_DATABASES: DatabasePreset[] = [
  {
    id: "sakila",
    name: "Sakila (DVD Rental)",
    badge: "Official Track",
    badgeColor: "bg-sky-950 text-sky-300 border-sky-700",
    description: "Classic relational schema with films, actors, categories, rentals, and payments.",
    tables: ["actor", "film", "category", "rental", "payment", "customer"],
    totalQuestions: "36 Milestones",
  },
  {
    id: "northwind",
    name: "Northwind (Store & Orders)",
    badge: "E-Commerce",
    badgeColor: "bg-amber-950 text-amber-300 border-amber-700",
    description: "Retail enterprise schema with products, categories, orders, order details, and employees.",
    tables: ["products", "categories", "orders", "order_details", "customers", "employees"],
    totalQuestions: "Auto-Exploration",
  },
  {
    id: "world",
    name: "World (Geography & Stats)",
    badge: "Demographics",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-700",
    description: "Global demographic statistics with countries, major cities, continents, and languages.",
    tables: ["country", "city", "country_language"],
    totalQuestions: "Auto-Exploration",
  },
];

export interface DatabaseSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  activeDbName: string;
  onSelectPreset: (presetId: string) => void;
  onUploadFile: (file: File) => void;
  onOpenManagerModal: () => void;
}

export const DatabaseSwitcher: React.FC<DatabaseSwitcherProps> = ({
  isOpen,
  onClose,
  activeDbName,
  onSelectPreset,
  onUploadFile,
  onOpenManagerModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      onClose();
    }
  };

  const isPresetActive = (preset: DatabasePreset) => {
    if (preset.id === "sakila") return activeDbName.toLowerCase().includes("sakila");
    if (preset.id === "northwind") return activeDbName.toLowerCase().includes("northwind");
    if (preset.id === "world") return activeDbName.toLowerCase().includes("world");
    return false;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-925">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-700/80 flex items-center justify-center">
              <Database className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Switch Database
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose a built-in practice database or load your own SQLite file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets List */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Built-in Sample Datasets
          </div>

          {PRESET_DATABASES.map((preset) => {
            const active = isPresetActive(preset);
            return (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-lg border transition flex items-start justify-between gap-3 group ${
                  active
                    ? "bg-sky-950/40 border-sky-600 ring-1 ring-sky-500/40 shadow-sm"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-100 group-hover:text-sky-300 transition">
                      {preset.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${preset.badgeColor}`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {preset.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>Tables: {preset.tables.slice(0, 4).join(", ")}…</span>
                    <span>•</span>
                    <span className="text-sky-400 font-semibold">{preset.totalQuestions}</span>
                  </div>
                </div>

                <div className="shrink-0 self-center">
                  {active ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-700 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Upload Custom DB Option */}
          <div className="pt-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">
              Custom Database File
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".db,.sqlite,.sqlite3,.sql"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-left p-3.5 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 hover:bg-slate-900 hover:border-sky-500 transition flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 group-hover:border-sky-500 group-hover:text-sky-300 transition">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                    Upload Local SQLite File (.db, .sqlite, .sql)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Loads instantly in-memory inside browser
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 truncate">
            Current: <strong className="text-sky-300">{activeDbName}</strong>
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenManagerModal();
            }}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>Question Packs & AI Prompts</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
