// ─── Agent Types ────────────────────────────────────────────────────────────

export type AgentStatus = 'online' | 'busy' | 'idle' | 'error' | 'offline';
export type AgentRole =
  | 'orchestrator'
  | 'researcher'
  | 'writer'
  | 'coder'
  | 'analyst'
  | 'reviewer'
  | 'planner'
  | 'executor';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar: string; // emoji or initials
  color: string;  // hex accent color
  description: string;
  capabilities: string[];
  tasksCompleted: number;
  tasksActive: number;
  successRate: number;   // 0-100
  avgLatencyMs: number;
  tokenUsage: number;    // total tokens consumed
  lastSeen: Date;
  position: { x: number; y: number }; // grid position in HQ map
  department: string;
}

// ─── Task / Mission Types ────────────────────────────────────────────────────

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'paused';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId: string;
  fromAgentId?: string; // who delegated this task
  missionId: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number; // 0-100
  output?: string;
  tags: string[];
}

export type MissionStatus = 'active' | 'completed' | 'failed' | 'planning' | 'paused';

export interface Mission {
  id: string;
  name: string;
  description: string;
  status: MissionStatus;
  objective: string;
  agentIds: string[];
  taskIds: string[];
  createdAt: Date;
  deadline?: Date;
  progress: number; // 0-100
  tags: string[];
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

export type ActivityType =
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'agent_online'
  | 'agent_offline'
  | 'message_sent'
  | 'tool_call'
  | 'handoff'
  | 'error';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ─── Store Types ──────────────────────────────────────────────────────────────

export interface UIState {
  selectedAgentId: string | null;
  selectedMissionId: string | null;
  selectedTaskId: string | null;
  inspectorOpen: boolean;
  sidebarCollapsed: boolean;
}
