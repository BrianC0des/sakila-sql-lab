import { useState, useEffect, useRef, useCallback } from "react";
import type { BridgeAction, BridgeMessage } from "./types";

export interface UseBridgeOptions {
  port?: number;
  url?: string;
  onMessage?: (msg: BridgeMessage) => void;
  reconnectInterval?: number;
}

export function useBridge(options: UseBridgeOptions = {}) {
  const {
    port = 3001,
    url,
    onMessage,
    reconnectInterval = 3000,
  } = options;

  const resolvedUrl = url ?? (typeof window !== "undefined"
    ? `ws://${window.location.hostname}:${port}/ws`
    : `ws://localhost:${port}/ws`);

  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<BridgeMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    function connect() {
      if (unmounted) return;

      try {
        ws = new WebSocket(resolvedUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!unmounted) setConnected(true);
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const data: BridgeMessage = JSON.parse(event.data);
            setLastMessage(data);
            onMessageRef.current?.(data);
          } catch (e) {
            console.error("Failed to parse bridge message:", e);
          }
        };

        ws.onclose = () => {
          if (!unmounted) {
            setConnected(false);
            timer = setTimeout(connect, reconnectInterval);
          }
        };

        ws.onerror = (err) => {
          console.error("Bridge WebSocket error:", err);
          ws?.close();
        };
      } catch {
        if (!unmounted) {
          timer = setTimeout(connect, reconnectInterval);
        }
      }
    }

    connect();

    return () => {
      unmounted = true;
      if (timer) clearTimeout(timer);
      if (ws) ws.close();
      socketRef.current = null;
    };
  }, [resolvedUrl, reconnectInterval]);

  const send = useCallback((message: BridgeMessage | { type: BridgeAction | string; [key: string]: any }) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const sendAction = useCallback((type: BridgeAction | string, extra?: Record<string, any>) => {
    return send({ type, timestamp: Date.now(), ...extra });
  }, [send]);

  const reportCrash = useCallback((error: Error, info?: any) => {
    return sendAction("REPORT_CRASH", {
      error: error.message,
      stack: error.stack,
      info,
    });
  }, [sendAction]);

  const requestHint = useCallback((level: number) => {
    return sendAction("HINT_REQUEST", { level });
  }, [sendAction]);

  const evaluate = useCallback((payload?: any) => {
    return sendAction("EVALUATE", { payload });
  }, [sendAction]);

  const submitCode = useCallback((code: string) => {
    return sendAction("SUBMIT_CODE", { code });
  }, [sendAction]);

  return {
    connected,
    lastMessage,
    send,
    sendAction,
    reportCrash,
    requestHint,
    evaluate,
    submitCode,
  };
}
