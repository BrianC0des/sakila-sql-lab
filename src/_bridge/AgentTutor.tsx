import React, { useState, useEffect, useRef } from "react";
import type { Challenge, TestResult } from "./types";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: number;
  visual?: {
    type: "flow" | "diff" | "metric";
    title: string;
    steps?: string[];
    diffLines?: { type: "add" | "remove" | "same"; text: string }[];
  };
}

interface AgentTutorProps {
  challenge: Challenge;
  testResults: TestResult[];
  onHintRequest: (level: number) => void;
  unlockedHintCount: number;
  onShowDiff?: () => void;
  onSendPrompt?: (prompt: string) => void;
}

export const AgentTutor: React.FC<AgentTutorProps> = ({
  challenge,
  testResults,
  onHintRequest,
  unlockedHintCount,
  onShowDiff,
  onSendPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<"tasks" | "chat">("tasks");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "agent",
      text: `Welcome! I'm your Socratic tutor for ${challenge.title}. I can guide you through the requirements, explain failing tests, and illustrate concepts with visual diagrams.`,
      timestamp: Date.now(),
      visual: {
        type: "flow",
        title: "Execution Roadmap",
        steps: [
          "1. Inspect starter code / query",
          "2. Review automated test criteria",
          "3. Iterate & verify green passes",
        ]
      }
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const passedCount = testResults.filter((t) => t.passed).length;
  const allPassed = testResults.length > 0 && passedCount === testResults.length;

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const generateSocraticReply = (userText: string) => {
    const lower = userText.toLowerCase();
    let replyText = "";
    let visualData: ChatMessage["visual"] | undefined;

    if (lower.includes("fail") || lower.includes("error") || lower.includes("test")) {
      const failingTest = testResults.find((t) => !t.passed);
      if (failingTest) {
        replyText = `Looking at test: "${failingTest.message}". Think about what conditions produce this mismatch. Are you filtering early enough, or is unexpected data slipping through?`;
        visualData = {
          type: "diff",
          title: "Test Diagnosis",
          diffLines: [
            { type: "remove", text: "- Current output: Fails assertion" },
            { type: "add", text: "+ Expected: Match reference behavior" }
          ]
        };
      } else {
        replyText = "All currently evaluated test assertions are passing! What specific edge case are you investigating?";
      }
    } else if (lower.includes("visual") || lower.includes("diagram") || lower.includes("flow") || lower.includes("how it works")) {
      if (challenge.category === "sql") {
        replyText = "Here is how SQLite evaluates this query pipeline from input to output:";
        visualData = {
          type: "flow",
          title: "SQL Execution Lifecycle",
          steps: [
            "FROM & JOIN: Assemble candidate rows from disk",
            "WHERE: Filter rows BEFORE aggregation",
            "GROUP BY & Aggregates: Bucket rows (COUNT, SUM, AVG)",
            "HAVING: Filter grouped buckets AFTER aggregation",
            "SELECT: Project columns & compute expressions",
            "ORDER BY & LIMIT: Sort and paginate final result set"
          ]
        };
      } else if (challenge.category === "react") {
        replyText = "Here is the React component lifecycle & state sync loop:";
        visualData = {
          type: "flow",
          title: "React State & Render Cycle",
          steps: [
            "1. User action triggers event (e.g. onClick, onChange)",
            "2. setState scheduled with new value",
            "3. Component re-renders with fresh state",
            "4. useEffect runs dependencies diff",
            "5. Virtual DOM committed to browser view"
          ]
        };
      } else {
        replyText = "Here is the security exploit attack path:";
        visualData = {
          type: "flow",
          title: "Vulnerability Execution Flow",
          steps: [
            "1. Input supplied without sanitization",
            "2. Injected control characters break string delimiter (' or \")",
            "3. Server interprets injected tokens as raw command/SQL logic",
            "4. Security perimeter bypassed ➔ Flag exfiltration"
          ]
        };
      }
    } else if (lower.includes("create") || lower.includes("course") || lower.includes("content") || lower.includes("goal")) {
      replyText = `💡 Note: I am the local browser Socratic hint engine! To generate new courses, add milestones, or write code into the lab, ask your terminal AI agent directly — it has direct disk access to write files, add challenges, and update your lab live.`;
    } else {
      replyText = `Regarding "${userText}": I'm your local Socratic companion for this active challenge. Try asking me "how does this query work?", "show diagram", or test your query with Ctrl+Enter to inspect execution errors!`;
    }

    const agentMsg: ChatMessage = {
      id: `agent-${Date.now()}`,
      sender: "agent",
      text: replyText,
      timestamp: Date.now(),
      visual: visualData
    };

    setMessages((prev) => [...prev, agentMsg]);
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || prompt).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    onSendPrompt?.(text);
    setPrompt("");

    // Switch to chat tab if sent from chips
    if (activeTab !== "chat") {
      setActiveTab("chat");
    }

    // Generate local Socratic guidance with visual after brief delay
    setTimeout(() => {
      generateSocraticReply(text);
    }, 450);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-200 select-text">
      {/* Top Tab Bar */}
      <div className="flex border-b border-slate-800 bg-slate-950">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex-1 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === "tasks"
              ? "border-sky-500 text-sky-400 bg-slate-900/80"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>📋 Tests &amp; Hints</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              allPassed ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-300"
            }`}
          >
            {passedCount}/{testResults.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === "chat"
              ? "border-sky-500 text-sky-400 bg-slate-900/80"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>💬 Live AI Chat</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-mono">
            Interactive
          </span>
        </button>
      </div>

      {/* TAB 1: Tasks, Automated Tests & Hints */}
      {activeTab === "tasks" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Test Runner Checklist */}
          <div className="p-4 border-b border-slate-800 bg-slate-925">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Automated Verification
              </h4>
              <span
                className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  allPassed
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {passedCount} / {testResults.length} Passed
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              {testResults.length === 0 ? (
                <div className="text-slate-500 text-[11px] py-1">
                  Run code or click test to evaluate assertions.
                </div>
              ) : (
                testResults.map((t) => (
                  <div key={t.id} className="flex items-start gap-2">
                    <span className={t.passed ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {t.passed ? "✓" : "✗"}
                    </span>
                    <span className={t.passed ? "text-slate-300" : "text-rose-300"}>{t.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tiered Hints */}
          <div className="p-4 flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                💡 Progressive Hints
              </h4>
              <span className="text-[11px] text-slate-500">
                {unlockedHintCount} of {challenge.hints.length} Unlocked
              </span>
            </div>
            <div className="space-y-2">
              {challenge.hints.slice(0, unlockedHintCount).map((hint, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-sky-950/30 border border-sky-900/60 text-xs text-sky-200 leading-relaxed shadow-sm"
                >
                  <strong className="text-sky-400 block mb-1">Clue #{idx + 1}:</strong>
                  {hint}
                </div>
              ))}
              {unlockedHintCount < challenge.hints.length && (
                <button
                  onClick={() => onHintRequest(unlockedHintCount + 1)}
                  className="w-full text-xs py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 font-semibold transition"
                >
                  🔓 Unlock Clue #{unlockedHintCount + 1}
                </button>
              )}
              {onShowDiff && challenge.referenceSolution && (
                <button
                  onClick={onShowDiff}
                  className="w-full text-xs py-2 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800 rounded text-indigo-300 font-semibold transition"
                >
                  🔍 Reveal Reference Solution Diff
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Live AI Chat with Visuals */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                  <span>{m.sender === "user" ? "You" : "🤖 Socratic Tutor"}</span>
                  <span>•</span>
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                <div
                  className={`max-w-[90%] p-3 rounded-lg text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-sky-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none shadow"
                  }`}
                >
                  {m.text}

                  {/* Render Visual Card if present */}
                  {m.visual && m.visual.type === "flow" && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/80 bg-slate-900/90 rounded p-2.5 font-mono text-[11px]">
                      <div className="font-bold text-sky-300 mb-1.5 flex items-center gap-1.5">
                        <span>📊</span>
                        <span>{m.visual.title}</span>
                      </div>
                      <div className="space-y-1">
                        {m.visual.steps?.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-sky-400 font-bold">→</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.visual && m.visual.type === "diff" && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/80 bg-slate-950 rounded p-2.5 font-mono text-[11px]">
                      <div className="font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                        <span>🔍</span>
                        <span>{m.visual.title}</span>
                      </div>
                      <div className="space-y-0.5">
                        {m.visual.diffLines?.map((d, dIdx) => (
                          <div
                            key={dIdx}
                            className={
                              d.type === "add"
                                ? "text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded"
                                : d.type === "remove"
                                ? "text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded"
                                : "text-slate-400"
                            }
                          >
                            {d.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Quick Question Action Chips */}
      <div className="px-3 pt-2 pb-1 bg-slate-950 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto">
        <button
          onClick={() => handleSend("Why did my test fail?")}
          className="text-[11px] px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap transition"
        >
          ❓ Why test failed?
        </button>
        <button
          onClick={() => handleSend("Show visual flow diagram")}
          className="text-[11px] px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-700 text-sky-300 whitespace-nowrap transition"
        >
          📊 Show Visual Flow
        </button>
        <button
          onClick={() => handleSend("Give me a conceptual clue")}
          className="text-[11px] px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-700 text-amber-300 whitespace-nowrap transition"
        >
          💡 Conceptual Clue
        </button>
      </div>

      {/* Interactive Input Prompt Box */}
      <div className="p-3 bg-slate-950">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask question, ask for diagram, or request component..."
            className="flex-1 bg-slate-900 border border-slate-750 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={() => handleSend()}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded transition shadow-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
