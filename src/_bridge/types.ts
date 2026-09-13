export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: "react" | "sql" | "ctf";
  difficulty: "beginner" | "intermediate" | "advanced";
  hints: string[];
  referenceSolution?: string;
}

export interface TestResult {
  id: string;
  passed: boolean;
  message: string;
}

export interface ProgressState {
  labName: string;
  template: string;
  port: number;
  bridgePort: number;
  createdAt?: string;
  completedMilestones: string[];
  currentStage: number;
  savedDraft?: string;
  unlockedHints?: Record<string, number>;
}

export type BridgeAction =
  | "CONNECTED"
  | "PING"
  | "PONG"
  | "EVALUATE"
  | "EVALUATE_ACK"
  | "HINT_REQUEST"
  | "HINT_REQUEST_ACK"
  | "SUBMIT_CODE"
  | "SUBMIT_CODE_ACK"
  | "REPORT_CRASH"
  | "REPORT_CRASH_ACK";

export interface BridgeMessage {
  type: BridgeAction | string;
  payload?: any;
  timestamp?: number;
  [key: string]: any;
}
