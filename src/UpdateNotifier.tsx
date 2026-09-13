import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, X, Sparkles, CheckCircle2 } from "lucide-react";

declare const __APP_BUILD_ID__: string | undefined;
declare const __APP_BUILD_TIME__: string | undefined;

export const currentBuildId = typeof __APP_BUILD_ID__ !== "undefined" ? __APP_BUILD_ID__ : "dev";
export const currentBuildTime = typeof __APP_BUILD_TIME__ !== "undefined" ? __APP_BUILD_TIME__ : new Date().toISOString();

export function useUpdateChecker() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<number>(Date.now());
  const [remoteBuildId, setRemoteBuildId] = useState<string | null>(null);

  const checkForUpdates = useCallback(async () => {
    setIsChecking(true);
    try {
      // Bust browser and intermediate proxy caches with timestamp query param and headers
      const res = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.buildId) {
          setRemoteBuildId(data.buildId);
          // If the remote build ID is different from our active build ID
          if (currentBuildId !== "dev" && data.buildId !== currentBuildId) {
            setHasUpdate(true);
          }
        }
      }
    } catch {
      // Network failure or offline, ignore gracefully
    } finally {
      setIsChecking(false);
      setLastChecked(Date.now());
    }
  }, []);

  useEffect(() => {
    // Initial check after 4s to allow initial WASM and assets to settle
    const initialTimer = setTimeout(() => {
      checkForUpdates();
    }, 4000);

    // Periodic background check every 45 seconds
    const interval = setInterval(() => {
      checkForUpdates();
    }, 45000);

    // Check immediately when user switches tabs back to the app
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForUpdates();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [checkForUpdates]);

  return {
    hasUpdate,
    isChecking,
    lastChecked,
    remoteBuildId,
    checkForUpdates,
  };
}

interface UpdateNotifierProps {
  hasUpdate: boolean;
  onRefresh?: () => void;
}

export const UpdateNotifier: React.FC<UpdateNotifierProps> = ({ hasUpdate, onRefresh }) => {
  const [dismissed, setDismissed] = useState(false);

  const handleReload = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  if (!hasUpdate) return null;

  // If dismissed, show a minimal discreet pill in bottom right
  if (dismissed) {
    return (
      <aside
        aria-label="Update notification"
        className="fixed bottom-3 right-3 z-50 animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={handleReload}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/95 border border-sky-500/80 text-sky-300 text-xs shadow-xl hover:bg-sky-950 transition cursor-pointer"
          title="Click to refresh and load the latest version"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-[11px]">Update Ready · Reload</span>
          <RefreshCw className="w-3 h-3 text-sky-400" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Update alert"
      data-test="floating-update-card"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto bg-slate-900/95 backdrop-blur-md border border-sky-500/80 rounded-xl shadow-2xl p-3.5 flex items-center justify-between gap-3 text-slate-100 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-700/60 text-sky-400 shrink-0">
          <RefreshCw className="w-4 h-4 animate-spin [animation-duration:4s]" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <span>Update Available</span>
            <span className="text-[10px] bg-sky-900/80 text-sky-300 font-mono px-1.5 py-0.2 rounded border border-sky-700/60">
              New
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            A new version of SQL Studio is live!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <button
          type="button"
          data-test="update-reload-btn"
          onClick={handleReload}
          className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
        >
          Refresh Now
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          title="Dismiss notification (reload later)"
          className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
