import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error in SQL Lab:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Something went wrong</h2>
              <p className="text-xs text-slate-400 mt-1">
                An unexpected interface error occurred.
              </p>
            </div>

            {this.state.error && (
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-left text-[11px] font-mono text-rose-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
