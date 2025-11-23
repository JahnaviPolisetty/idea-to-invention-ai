export interface IdeaIntakeResult {
  title: string;
  summary: string;
}

export interface AgentResult {
  agent: string;
  output: string;
  executionTime: number;
  timestamp: number;
}

export interface InventionBlueprint {
  id: string;
  rawIdea: string;
  title: string;
  summary: string;
  problemStatement: string;
  research: string;
  feasibility: string;
  innovation: string;
  patentDocument: string;
  createdAt: number;
  agentResults: AgentResult[];
}

export type AgentStatus = "pending" | "active" | "complete" | "error";

export interface AgentStepInfo {
  name: string;
  status: AgentStatus;
  startTime?: number;
  endTime?: number;
  output?: string;
}
