import React, { useRef, useLayoutEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import "./prism-theme.css";

interface SqlCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onFormat: () => void;
  placeholder?: string;
}

export const SqlCodeEditor: React.FC<SqlCodeEditorProps> = ({
  value,
  onChange,
  onRun,
  onFormat,
  placeholder = "Write your SQL query here...",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Synchronize scroll on every scroll event
  const syncScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useLayoutEffect(() => {
    syncScroll();
  });

  // If value ends with a newline, append an extra space so <pre> matches <textarea> height exactly
  const highlightedHtml = React.useMemo(() => {
    if (!value) return "";
    const textToHighlight = value.endsWith("\n") ? value + " " : value;
    return Prism.highlight(textToHighlight, Prism.languages.sql, "sql");
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Run Query Shortcut: Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
      return;
    }

    // Format Shortcut: Shift+Alt+F or Ctrl+Shift+F
    if (
      (e.shiftKey && e.altKey && e.key.toLowerCase() === "f") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f")
    ) {
      e.preventDefault();
      onFormat();
      return;
    }

    // Tab key: Insert 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const next = val.substring(0, start) + "  " + val.substring(end);
      onChange(next);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
        syncScroll();
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 border border-slate-800 rounded focus-within:border-sky-500 overflow-hidden">
      {/* Background Syntax Highlighted Code Layer */}
      <pre
        ref={preRef}
        aria-hidden="true"
        className="sql-code-layer"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />

      {/* Foreground Interactive Transparent Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        className="sql-code-layer"
      />
    </div>
  );
};
