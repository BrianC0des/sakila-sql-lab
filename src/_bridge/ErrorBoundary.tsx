import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  onSendToAgent?: (error: any, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: any;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null, errorInfo: null };

  public static getDerivedStateFromError(error: any): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: any, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onSendToAgent?.(error, errorInfo);
  }

  public reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg bg-red-950/40 border border-red-500/50 text-red-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>Live Component Crash Detected</span>
            </h3>
            <button
              onClick={this.reset}
              className="text-xs px-2.5 py-1 bg-red-900 hover:bg-red-800 text-red-100 rounded transition"
            >
              Retry
            </button>
          </div>
          <p className="text-sm font-mono bg-red-950/80 p-3 rounded border border-red-900 overflow-x-auto">
            {this.state.error instanceof Error
              ? this.state.error.message
              : String(this.state.error || "Unknown runtime exception")}
          </p>
          <p className="text-xs text-red-400/80 mt-2">
            The tutor and tester panels remain active. You can edit <code>LiveSlot.tsx</code> or ask the AI tutor for a fix.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
