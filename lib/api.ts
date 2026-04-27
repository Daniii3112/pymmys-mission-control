/**
 * Typed API client for the Pymmys FastAPI backend.
 *
 * All date fields arrive from the API as ISO-8601 strings.
 * This module parses them back to Date objects so the rest
 * of the app keeps working exactly as before.
 */

import type { Agent, Mission, Task, ActivityEvent, ActivityType } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Raw API shapes (ISO strings for dates) ───────────────────────────────────

interface RawAgent {
  id: string;
  name: string;
  role: string;
  status: string;
  avatar: string;
  color: string;
  description: string;
  capabilities: string[];
  tasksCompleted: number;
  tasksActive: number;
  successRate: number;
  avgLatencyMs: number;
  tokenUsage: number;
  lastSeen: string;          // ISO string
  position: { x: number; y: number };
  department: string;
}

interface RawTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedAgentId: string;
  fromAgentId?: string;
  missionId: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
  output?: string;
  tags: string[];
}

interface RawMission {
  id: string;
  name: string;
  description: string;
  status: string;
  objective: string;
  agentIds: string[];
  taskIds: string[];
  createdAt: string;
  deadline?: string;
  progress: number;
  tags: string[];
  tasks: RawTask[];
}

interface RawActivityEvent {
  id: string;
  type: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: string;        // ISO string
  metadata?: Record<string, unknown>;
}

export interface SystemSummary {
  totalAgents: number;
  activeAgents: number;
  busyAgents: number;
  totalMissions: number;
  activeMissions: number;
  completedTasks: number;
  runningTasks: number;
  totalTokenUsage: number;
  uptimeSeconds: number;
}

// ─── Parsers — ISO string → Date ──────────────────────────────────────────────

function parseAgent(raw: RawAgent): Agent {
  return {
    ...raw,
    role: raw.role as Agent['role'],
    status: raw.status as Agent['status'],
    lastSeen: new Date(raw.lastSeen),
  };
}

function parseTask(raw: RawTask): Task {
  return {
    ...raw,
    status: raw.status as Task['status'],
    priority: raw.priority as Task['priority'],
    createdAt: new Date(raw.createdAt),
    startedAt: raw.startedAt ? new Date(raw.startedAt) : undefined,
    completedAt: raw.completedAt ? new Date(raw.completedAt) : undefined,
  };
}

function parseMission(raw: RawMission): Mission {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    status: raw.status as Mission['status'],
    objective: raw.objective,
    agentIds: raw.agentIds,
    taskIds: raw.taskIds,
    createdAt: new Date(raw.createdAt),
    deadline: raw.deadline ? new Date(raw.deadline) : undefined,
    progress: raw.progress,
    tags: raw.tags,
  };
}

function parseActivity(raw: RawActivityEvent): ActivityEvent {
  return {
    id: raw.id,
    type: raw.type as ActivityType,
    agentId: raw.agentId,
    agentName: raw.agentName,
    message: raw.message,
    timestamp: new Date(raw.timestamp),
    metadata: raw.metadata,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<Agent[]> {
  const raw = await apiFetch<RawAgent[]>('/agents');
  return raw.map(parseAgent);
}

/** Returns missions with embedded tasks. Tasks are stripped before storing
 *  as missions, and returned separately for the tasks slice of the store. */
export async function fetchMissionsWithTasks(): Promise<{ missions: Mission[]; tasks: Task[] }> {
  const raw = await apiFetch<RawMission[]>('/missions');
  const missions = raw.map(parseMission);
  const tasks = raw.flatMap((m) => m.tasks.map(parseTask));
  return { missions, tasks };
}

export async function fetchActivity(limit = 100): Promise<ActivityEvent[]> {
  const raw = await apiFetch<RawActivityEvent[]>(`/activity?limit=${limit}`);
  return raw.map(parseActivity);
}

export async function fetchSystemSummary(): Promise<SystemSummary> {
  return apiFetch<SystemSummary>('/system/summary');
}

export async function runAgent(agentId: string): Promise<{ ok: boolean; message: string }> {
  return apiFetch<{ ok: boolean; message: string }>(`/agents/${agentId}/run`, {
    method: 'POST',
  });
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  priority?: string;
  assigned_agent_id: string;
  tags?: string[];
}

export interface CreateMissionPayload {
  name: string;
  description?: string;
  objective?: string;
  status?: string;
  agent_ids?: string[];
  tags?: string[];
  deadline?: string;
  tasks?: TaskCreatePayload[];
}

export async function createMission(payload: CreateMissionPayload): Promise<Mission> {
  const raw = await apiFetch<RawMission>('/missions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return parseMission(raw);
}
