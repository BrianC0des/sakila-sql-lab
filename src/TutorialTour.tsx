import React, { useState, useEffect, useLayoutEffect } from "react";
import { Sparkles, ChevronRight, ChevronLeft, X, Check, BookOpen, Code2, Database, Play } from "lucide-react";

export interface TourStep {
  targetSelector?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  placement?: "right" | "bottom" | "left" | "top" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to SQL Studio! ⚡",
    description:
      "A 100% browser-based, zero-login SQL learning environment powered by SQLite WASM. Let's take a quick 30-second tour of what you can do here!",
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    placement: "center"
  },
  {
    targetSelector: "[data-tour='sidebar']",
    title: "1. 36 Milestones & Difficulty Category Filters",
    description:
      "Navigate through 36 hands-on milestones spanning foundational SELECTs, multi-table JOINs, subqueries, and classic exam traps. Use the category filter pills (All, Beginner, Intermediate, Advanced, Custom) to focus your study sessions.",
    icon: <BookOpen className="w-5 h-5 text-sky-400" />,
    placement: "right"
  },
  {
    targetSelector: "[data-tour='db-switcher-btn']",
    title: "2. Instant Database Switcher",
    description:
      "Easily switch between bundled sample databases (Sakila DVD rental, Northwind commerce, World demographics) or upload any custom SQLite file with a single click.",
    icon: <Database className="w-5 h-5 text-sky-400" />,
    placement: "bottom"
  },
  {
    targetSelector: "[data-tour='editor']",
    title: "3. Syntax Highlighting & Real-Time Linter",
    description:
      "Write queries with Prism.js syntax coloring. The editor automatically validates your syntax with SQLite's EXPLAIN query engine in real-time. Use Shift+Alt+F to format your SQL and Ctrl+Enter to run.",
    icon: <Code2 className="w-5 h-5 text-emerald-400" />,
    placement: "bottom"
  },
  {
    targetSelector: "[data-tour='run-btn']",
    title: "4. Automated Query Verification & Plan Analysis",
    description:
      "When you execute your query, results are instantly checked against reference answers. You'll see matching rows, column types, performance in milliseconds, and query plan trees.",
    icon: <Play className="w-5 h-5 text-emerald-400" />,
    placement: "bottom"
  },
  {
    targetSelector: "[data-tour='cheatsheet-tab']",
    title: "5. Query Architecture Cheat Sheet",
    description:
      "Switch here to review the 7-step conceptual query execution order (FROM → WHERE → GROUP BY → ...), 5 common exam traps, 7 query shapes, and a live schema reference of the active database.",
    icon: <BookOpen className="w-5 h-5 text-amber-400" />,
    placement: "bottom"
  },
  {
    targetSelector: "[data-tour='db-modal-btn']",
    title: "6. Custom Packs & AI Prompt Generator",
    description:
      "Import your own SQLite databases or generate AI prompts for ChatGPT/Claude (with selectable batch sizes from 5 to 20 questions and custom topics) to create and batch import tailored question packs.",
    icon: <Database className="w-5 h-5 text-purple-400" />,
    placement: "bottom"
  }
];

interface TutorialTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialTour: React.FC<TutorialTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStep];

  // Update target rect whenever step changes or window resizes
  useLayoutEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          return;
        }
      }
      setTargetRect(null);
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, currentStep, step.targetSelector]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem("sql_studio_tutorial_completed", "true");
    } catch {}
    onClose();
  };

  // Compute card positioning relative to target element
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect || step.placement === "center") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100
      };
    }

    const margin = 12;
    const cardWidth = 360;

    if (step.placement === "right") {
      return {
        position: "fixed",
        top: Math.max(20, Math.min(window.innerHeight - 300, targetRect.top + 20)),
        left: Math.min(window.innerWidth - cardWidth - 20, targetRect.right + margin),
        zIndex: 100
      };
    }

    if (step.placement === "bottom") {
      return {
        position: "fixed",
        top: Math.min(window.innerHeight - 280, targetRect.bottom + margin),
        left: Math.max(20, Math.min(window.innerWidth - cardWidth - 20, targetRect.left)),
        zIndex: 100
      };
    }

    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 100
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      {/* Dark backdrop */}
      <div
        onClick={handleComplete}
        className="fixed inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity duration-300"
      />

      {/* Spotlight cutout around target */}
      {targetRect && (
        <div
          className="fixed rounded-lg pointer-events-none transition-all duration-300 ring-4 ring-sky-500/80 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            zIndex: 90
          }}
        />
      )}

      {/* Tour Card */}
      <div
        style={getCardStyle()}
        className="w-[360px] max-w-[90vw] p-5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              {step.icon || <Sparkles className="w-5 h-5 text-sky-400" />}
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <h3 className="text-sm font-bold text-slate-100">{step.title}</h3>
            </div>
          </div>

          <button
            onClick={handleComplete}
            title="Skip Tour"
            className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {step.description}
        </p>

        {/* Progress dots & controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? "w-5 bg-sky-400" : "w-1.5 bg-slate-700"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
            >
              Skip
            </button>

            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition shadow flex items-center gap-1"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Got it!
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
