import React, { useState, useRef, useEffect, useCallback } from "react";

export interface SplitPaneProps {
  direction?: "horizontal" | "vertical"; // horizontal = left/right panes; vertical = top/bottom panes
  initialSize?: number; // Initial size in pixels of the primary pane
  minSize?: number;
  maxSize?: number;
  primary?: "first" | "second"; // Which pane has the fixed/resizable pixel size (default: "second" for drawers, "first" for editors)
  className?: string;
  firstPane: React.ReactNode;
  secondPane: React.ReactNode;
  onResize?: (newSize: number) => void;
  collapsed?: boolean;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  direction = "horizontal",
  initialSize = 380,
  minSize = 200,
  maxSize = 800,
  primary = "second",
  className = "",
  firstPane,
  secondPane,
  onResize,
  collapsed = false,
}) => {
  const [size, setSize] = useState<number>(initialSize);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSize(initialSize);
  }, [initialSize]);

  const isHorizontal = direction === "horizontal";

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setSize(initialSize);
    onResize?.(initialSize);
  }, [initialSize, onResize]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      let newSize: number;
      if (isHorizontal) {
        if (primary === "second") {
          newSize = rect.right - e.clientX;
        } else {
          newSize = e.clientX - rect.left;
        }
      } else {
        if (primary === "second") {
          newSize = rect.bottom - e.clientY;
        } else {
          newSize = e.clientY - rect.top;
        }
      }

      // Constrain within min and max
      const effectiveMax = Math.min(
        maxSize,
        (isHorizontal ? rect.width : rect.height) - minSize
      );
      const clamped = Math.max(minSize, Math.min(newSize, effectiveMax));
      setSize(clamped);
      onResize?.(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isHorizontal, primary, minSize, maxSize, onResize]);

  // Dynamic styling for panes
  const firstStyle: React.CSSProperties = isHorizontal
    ? primary === "first"
      ? { width: `${size}px`, flexShrink: 0 }
      : { flex: 1, minWidth: 0 }
    : primary === "first"
    ? { height: `${size}px`, flexShrink: 0 }
    : { flex: 1, minHeight: 0 };

  const secondStyle: React.CSSProperties = isHorizontal
    ? primary === "second"
      ? { width: `${size}px`, flexShrink: 0 }
      : { flex: 1, minWidth: 0 }
    : primary === "second"
    ? { height: `${size}px`, flexShrink: 0 }
    : { flex: 1, minHeight: 0 };

  if (collapsed) {
    return (
      <div className={`w-full h-full overflow-hidden ${className}`}>
        {secondPane}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex ${
        isHorizontal ? "flex-row" : "flex-col"
      } w-full h-full overflow-hidden select-none ${
        isDragging
          ? isHorizontal
            ? "cursor-col-resize select-none"
            : "cursor-row-resize select-none"
          : ""
      } ${className}`}
    >
      {/* First Pane */}
      <div style={firstStyle} className="overflow-hidden flex flex-col min-w-0 min-h-0">
        {firstPane}
      </div>

      {/* Draggable Divider Handle */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title="Drag to resize panel (Double-click to reset)"
        className={`group relative flex items-center justify-center transition-colors z-20 shrink-0 ${
          isHorizontal
            ? "w-1.5 cursor-col-resize hover:bg-sky-500/25 active:bg-sky-500/40 border-x border-slate-700/60"
            : "h-1.5 cursor-row-resize hover:bg-sky-500/25 active:bg-sky-500/40 border-y border-slate-700/60"
        } ${
          isDragging
            ? "bg-sky-500/40 border-sky-400"
            : "bg-slate-800/80"
        }`}
      >
        {/* Grip Indicator */}
        <div
          className={`rounded-full bg-slate-500 transition-colors group-hover:bg-sky-400 ${
            isDragging ? "bg-sky-400" : ""
          } ${isHorizontal ? "w-1 h-8" : "h-1 w-8"}`}
        />
      </div>

      {/* Second Pane */}
      <div style={secondStyle} className="overflow-hidden flex flex-col min-w-0 min-h-0">
        {secondPane}
      </div>
    </div>
  );
};
