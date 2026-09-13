import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function startBridgeServer(port: number, labDir: string) {
  const progressFile = join(labDir, ".progress.json");
  const eventLogFile = join(labDir, ".event-log.jsonl");

  return Bun.serve({
    hostname: "127.0.0.1",
    port,
    fetch(req, server) {
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }

      const url = new URL(req.url);
      if (url.pathname === "/health") {
        return Response.json({ status: "healthy", port }, { headers: CORS_HEADERS });
      }
      if (url.pathname === "/ws") {
        if (server.upgrade(req)) return;
        return new Response("Upgrade failed", { status: 400, headers: CORS_HEADERS });
      }
      if (url.pathname === "/api/progress" && req.method === "GET") {
        if (existsSync(progressFile)) {
          return new Response(readFileSync(progressFile, "utf-8"), {
            headers: {
              "Content-Type": "application/json",
              ...CORS_HEADERS,
            },
          });
        }
        return Response.json({}, { headers: CORS_HEADERS });
      }
      return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
    },
    websocket: {
      open(ws) {
        ws.send(JSON.stringify({ type: "CONNECTED", timestamp: Date.now() }));
      },
      message(ws, raw) {
        try {
          const event = JSON.parse(String(raw));

          try {
            appendFileSync(eventLogFile, JSON.stringify(event) + "\n");
          } catch (logErr) {
            console.error("Failed to append to event log:", logErr);
          }

          if (event.type === "PING") {
            ws.send(JSON.stringify({ type: "PONG" }));
          } else if (event.type === "EVALUATE") {
            ws.send(JSON.stringify({ type: "EVALUATE_ACK", payload: event.payload, timestamp: Date.now() }));
          } else if (event.type === "HINT_REQUEST") {
            ws.send(JSON.stringify({ type: "HINT_REQUEST_ACK", level: event.level, timestamp: Date.now() }));
          } else if (event.type === "SUBMIT_CODE") {
            ws.send(JSON.stringify({ type: "SUBMIT_CODE_ACK", timestamp: Date.now() }));
          } else if (event.type === "REPORT_CRASH") {
            ws.send(JSON.stringify({ type: "REPORT_CRASH_ACK", timestamp: Date.now() }));
          }
        } catch (e) {
          console.error("Malformed bridge message:", e);
        }
      },
    },
  });
}

if (import.meta.main) {
  const port = Number(process.env.BRIDGE_PORT || 3001);
  const labDir = process.cwd();
  startBridgeServer(port, labDir);
  console.log(`🔌 Bridge daemon listening on ws://127.0.0.1:${port}/ws`);
}
