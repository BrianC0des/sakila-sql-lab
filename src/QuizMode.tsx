import React, { useState, useCallback, useEffect } from "react";
import { quizBatches, QuizBatch, QuizQuestion } from "./quizzes";
import {
  GraduationCap,
  Check,
  X,
  RotateCcw,
  LayoutGrid,
  Trophy,
  ThumbsUp,
  BookOpen,
  ArrowRight,
  Target,
  Search,
  Brain,
  ClipboardList,
  AlertTriangle,
  Type,
  BarChart3,
  Hash,
  Package,
  FlaskConical,
  Shuffle,
  Link2,
  ArrowLeft,
  GitMerge,
  Layers,
  RefreshCw,
  Key,
  Film,
  HelpCircle,
} from "lucide-react";

// ─── Batch Icon Component ───────────────────────────────────────────────────

const BatchIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = "w-4 h-4" }) => {
  switch (icon) {
    case "target":
      return <Target className={`${className} text-sky-400`} />;
    case "search":
      return <Search className={`${className} text-emerald-400`} />;
    case "brain":
      return <Brain className={`${className} text-purple-400`} />;
    case "clipboard":
      return <ClipboardList className={`${className} text-amber-400`} />;
    case "alert":
      return <AlertTriangle className={`${className} text-rose-400`} />;
    case "type":
      return <Type className={`${className} text-cyan-400`} />;
    case "chart":
      return <BarChart3 className={`${className} text-indigo-400`} />;
    case "hash":
      return <Hash className={`${className} text-teal-400`} />;
    case "package":
      return <Package className={`${className} text-orange-400`} />;
    case "flask":
      return <FlaskConical className={`${className} text-lime-400`} />;
    case "shuffle":
      return <Shuffle className={`${className} text-yellow-400`} />;
    case "link":
      return <Link2 className={`${className} text-blue-400`} />;
    case "arrow-left":
      return <ArrowLeft className={`${className} text-indigo-400`} />;
    case "merge":
      return <GitMerge className={`${className} text-violet-400`} />;
    case "layers":
      return <Layers className={`${className} text-pink-400`} />;
    case "refresh":
      return <RefreshCw className={`${className} text-emerald-400`} />;
    case "key":
      return <Key className={`${className} text-amber-400`} />;
    case "film":
      return <Film className={`${className} text-rose-400`} />;
    default:
      return <HelpCircle className={`${className} text-slate-400`} />;
  }
};

// ─── Types ──────────────────────────────────────────────────────────────────

type QuizView = "home" | "quiz" | "results";

interface QuizSession {
  batch: QuizBatch;
  currentIdx: number;
  selectedOption: number | null;
  revealed: boolean;
  score: number;
  answers: (number | null)[];
}

// ─── Badge ───────────────────────────────────────────────────────────────────

const DiffBadge: React.FC<{ level: "beginner" | "intermediate" | "advanced" }> = ({ level }) => {
  const colors: Record<string, string> = {
    beginner: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
    intermediate: "bg-amber-900/60 text-amber-300 border-amber-700",
    advanced: "bg-red-900/60 text-red-300 border-red-700",
  };
  return (
    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${colors[level]}`}>
      {level}
    </span>
  );
};

// ─── Topic Badge ──────────────────────────────────────────────────────────────

const TopicBadge: React.FC<{ topic: string }> = ({ topic }) => {
  const topicColors: Record<string, string> = {
    "Retrieve Data": "bg-sky-900/40 text-sky-300 border-sky-700/50",
    "Analyze Data": "bg-violet-900/40 text-violet-300 border-violet-700/50",
    "Connect Data": "bg-teal-900/40 text-teal-300 border-teal-700/50",
    "Complex Queries": "bg-orange-900/40 text-orange-300 border-orange-700/50",
    "Patterns & Concepts": "bg-slate-700/60 text-slate-300 border-slate-600",
    "All Topics": "bg-amber-900/40 text-amber-300 border-amber-700/50",
  };
  const cls = topicColors[topic] || "bg-slate-700/60 text-slate-300 border-slate-600";
  return (
    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${cls}`}>
      {topic}
    </span>
  );
};

// ─── Home Screen ─────────────────────────────────────────────────────────────

const QuizHome: React.FC<{
  batchScores: Record<string, number>;
  onStart: (batch: QuizBatch) => void;
}> = ({ batchScores, onStart }) => {
  const totalQ = quizBatches.reduce((acc, b) => acc + b.questions.length, 0);
  const completedBatches = Object.keys(batchScores).length;

  return (
    <div className="h-full overflow-y-auto px-4 py-5">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-sky-400" />
          <span>SQL Quiz Mode</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {quizBatches.length} topic batches · {totalQ} questions · covers the full SQL cheatsheet
        </p>
        {completedBatches > 0 && (
          <div className="mt-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{completedBatches}</span>/{quizBatches.length} batches attempted
          </div>
        )}
      </div>

      {/* Batch Grid */}
      <div className="space-y-2">
        {quizBatches.map((batch) => {
          const score = batchScores[batch.id];
          const attempted = score !== undefined;
          const pct = attempted ? Math.round((score / batch.questions.length) * 100) : null;

          return (
            <button
              key={batch.id}
              onClick={() => onStart(batch)}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="shrink-0">
                    <BatchIcon icon={batch.icon} className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-100 truncate group-hover:text-white">
                      {batch.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <TopicBadge topic={batch.topic} />
                      <DiffBadge level={batch.difficulty} />
                      <span className="text-[10px] text-slate-500">{batch.questions.length} Qs</span>
                    </div>
                  </div>
                </div>

                {/* Score or arrow */}
                <div className="shrink-0 flex flex-col items-end">
                  {attempted ? (
                    <>
                      <span className={`text-sm font-bold ${pct! >= 80 ? "text-emerald-400" : pct! >= 50 ? "text-amber-400" : "text-red-400"}`}>
                        {pct}%
                      </span>
                      <span className="text-[10px] text-slate-500">{score}/{batch.questions.length}</span>
                    </>
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition" />
                  )}
                </div>
              </div>

              {/* Score bar */}
              {attempted && (
                <div className="mt-2 h-1 w-full rounded-full bg-slate-700">
                  <div
                    className={`h-1 rounded-full transition-all ${pct! >= 80 ? "bg-emerald-500" : pct! >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Question View ───────────────────────────────────────────────────────────

const QuestionView: React.FC<{
  session: QuizSession;
  onSelect: (idx: number) => void;
  onReveal: () => void;
  onNext: () => void;
  onQuit: () => void;
}> = ({ session, onSelect, onReveal, onNext, onQuit }) => {
  const { batch, currentIdx, selectedOption, revealed, score } = session;
  const q: QuizQuestion = batch.questions[currentIdx];
  const isLast = currentIdx === batch.questions.length - 1;
  const isCorrect = selectedOption === q.correct;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900 shrink-0 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-100 truncate flex items-center gap-1.5">
            <BatchIcon icon={batch.icon} className="w-4 h-4 shrink-0" />
            <span>{batch.title}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400">
              Q{currentIdx + 1}/{batch.questions.length}
            </span>
            <span className="text-[10px] text-emerald-400 inline-flex items-center gap-0.5">
              <Check className="w-3 h-3" />
              <span>{score} correct</span>
            </span>
          </div>
        </div>
        <button
          onClick={onQuit}
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition shrink-0"
        >
          <X className="w-3 h-3" />
          <span>Quit</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-slate-800 shrink-0">
        <div
          className="h-0.5 bg-sky-500 transition-all"
          style={{ width: `${((currentIdx) / batch.questions.length) * 100}%` }}
        />
      </div>

      {/* Question + Options */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-sm font-semibold text-slate-100 leading-relaxed mb-4">
          {q.question}
        </p>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = "border-slate-700 bg-slate-800/40 text-slate-200 hover:border-sky-500 hover:bg-slate-700/40";
            if (revealed) {
              if (i === q.correct) cls = "border-emerald-500 bg-emerald-900/40 text-emerald-100";
              else if (i === selectedOption && !isCorrect) cls = "border-red-500 bg-red-900/40 text-red-200";
              else cls = "border-slate-700/50 bg-slate-800/20 text-slate-500";
            } else if (selectedOption === i) {
              cls = "border-sky-500 bg-sky-900/30 text-sky-100";
            }

            return (
              <button
                key={i}
                onClick={() => !revealed && onSelect(i)}
                disabled={revealed}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs leading-relaxed transition-all flex items-center justify-between ${cls} ${
                  revealed ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div>
                  <span className="font-mono text-[10px] mr-2 opacity-70">{String.fromCharCode(65 + i)}.</span>
                  <span>{opt}</span>
                </div>
                {revealed && i === q.correct && (
                  <Check className="w-4 h-4 ml-2 text-emerald-400 shrink-0" />
                )}
                {revealed && i === selectedOption && !isCorrect && (
                  <X className="w-4 h-4 ml-2 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && (
          <div className={`mt-4 p-3 rounded-lg border text-xs leading-relaxed ${
            isCorrect
              ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-200"
              : "bg-red-900/30 border-red-700/50 text-red-200"
          }`}>
            <span className="font-bold mr-1 inline-flex items-center gap-1">
              {isCorrect ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>Not quite.</span>
                </>
              )}
            </span>
            {q.explanation}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900 shrink-0 flex justify-end gap-2">
        {!revealed ? (
          <button
            onClick={onReveal}
            disabled={selectedOption === null}
            className="text-xs px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded font-semibold transition"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={onNext}
            className="text-xs px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition"
          >
            {isLast ? "See Results →" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Results Screen ───────────────────────────────────────────────────────────

const ResultsView: React.FC<{
  session: QuizSession;
  onRetry: () => void;
  onHome: () => void;
}> = ({ session, onRetry, onHome }) => {
  const { batch, score, answers } = session;
  const total = batch.questions.length;
  const pct = Math.round((score / total) * 100);

  const grade =
    pct >= 90 ? { label: "Excellent!", Icon: Trophy, color: "text-emerald-400" }
    : pct >= 75 ? { label: "Good job!", Icon: ThumbsUp, color: "text-sky-400" }
    : pct >= 50 ? { label: "Keep practising", Icon: BookOpen, color: "text-amber-400" }
    : { label: "Review the material", Icon: RotateCcw, color: "text-rose-400" };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 shrink-0 flex items-center gap-2">
        <BatchIcon icon={batch.icon} className="w-4 h-4 shrink-0" />
        <h3 className="text-sm font-bold text-slate-100">{batch.title} — Results</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${grade.color}`}>{pct}%</div>
          <div className="text-xs text-slate-400 mt-1">{score} / {total} correct</div>
          <div className={`text-sm font-semibold mt-1.5 inline-flex items-center justify-center gap-1.5 ${grade.color}`}>
            <grade.Icon className="w-4 h-4" />
            <span>{grade.label}</span>
          </div>

          {/* Score bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-slate-700">
            <div
              className={`h-2 rounded-full transition-all ${
                pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Answer Review */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Answer Review</p>
          {batch.questions.map((q, i) => {
            const chosen = answers[i];
            const correct = chosen === q.correct;
            return (
              <div
                key={q.id}
                className={`p-2.5 rounded-lg border text-xs ${
                  correct
                    ? "bg-emerald-900/20 border-emerald-700/40"
                    : "bg-red-900/20 border-red-700/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="shrink-0">
                    {correct ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </span>
                  <span className="text-slate-300 font-medium">{q.question}</span>
                </div>
                {!correct && (
                  <div className="text-[11px] text-slate-400 mt-1 ml-5">
                    Your answer: <span className="text-red-300">{chosen !== null ? q.options[chosen] : "—"}</span>
                    <br />
                    Correct: <span className="text-emerald-300">{q.options[q.correct]}</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-1 ml-5 leading-relaxed">{q.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900 shrink-0 flex gap-2">
        <button
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
        <button
          onClick={onHome}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-semibold transition"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>All Batches</span>
        </button>
      </div>
    </div>
  );
};

// ─── Main QuizMode Component ─────────────────────────────────────────────────

const QuizMode: React.FC = () => {
  const [view, setView] = useState<QuizView>("home");
  const [session, setSession] = useState<QuizSession | null>(null);
  const [batchScores, setBatchScores] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("sakila_quiz_scores");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save scores to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sakila_quiz_scores", JSON.stringify(batchScores));
    } catch (e) {
      console.warn("Could not persist quiz scores to localStorage", e);
    }
  }, [batchScores]);

  const startBatch = useCallback((batch: QuizBatch) => {
    setSession({
      batch,
      currentIdx: 0,
      selectedOption: null,
      revealed: false,
      score: 0,
      answers: new Array(batch.questions.length).fill(null),
    });
    setView("quiz");
  }, []);

  const handleSelect = useCallback((idx: number) => {
    setSession((s) => s ? { ...s, selectedOption: idx } : s);
  }, []);

  const handleReveal = useCallback(() => {
    setSession((s) => s ? { ...s, revealed: true } : s);
  }, []);

  const handleNext = useCallback(() => {
    setSession((s) => {
      if (!s) return s;
      const isCorrect = s.selectedOption === s.batch.questions[s.currentIdx].correct;
      const newAnswers = [...s.answers];
      newAnswers[s.currentIdx] = s.selectedOption;
      const newScore = s.score + (isCorrect ? 1 : 0);
      const isLast = s.currentIdx === s.batch.questions.length - 1;

      if (isLast) {
        setBatchScores((prev) => ({ ...prev, [s.batch.id]: newScore }));
        return { ...s, score: newScore, answers: newAnswers };
      }
      return {
        ...s,
        currentIdx: s.currentIdx + 1,
        selectedOption: null,
        revealed: false,
        score: newScore,
        answers: newAnswers,
      };
    });

    setSession((s) => {
      if (!s) return s;
      const isLast = s.currentIdx === s.batch.questions.length - 1;
      if (isLast) {
        setView("results");
      }
      return s;
    });
  }, []);

  const handleRetry = useCallback(() => {
    if (session) startBatch(session.batch);
  }, [session, startBatch]);

  const handleHome = useCallback(() => {
    setView("home");
    setSession(null);
  }, []);

  const handleQuit = useCallback(() => {
    handleHome();
  }, [handleHome]);

  if (view === "home") {
    return <QuizHome batchScores={batchScores} onStart={startBatch} />;
  }

  if (view === "quiz" && session) {
    return (
      <QuestionView
        session={session}
        onSelect={handleSelect}
        onReveal={handleReveal}
        onNext={handleNext}
        onQuit={handleQuit}
      />
    );
  }

  if (view === "results" && session) {
    return (
      <ResultsView
        session={session}
        onRetry={handleRetry}
        onHome={handleHome}
      />
    );
  }

  return null;
};

export default QuizMode;
