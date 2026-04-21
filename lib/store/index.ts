'use client';

import { create } from 'zustand';
import type { Agent, Mission, Task, ActivityEvent, UIState } from '@/types';
import {
  fetchAgents,
  fetchMissionsWithTasks,
  fetchActivity,
  type SystemSummary,
} from '@/lib/api';

// ─── Store shape ──────────────────────────────────────────────────────────────

interface AppStore {
  // Server-driven data
  agents: Agent[];
  missions: Mission[];
  tasks: Task[];
  activity: ActivityEvent[];
  systemSummary: SystemSummary | null;

  // Fetch state
  loading: boolean;
  error: string | null;

  // UI state — unchanged from before
  ui: UIState;

  // Data setters (called by the polling loop)
  setAgents: (agents: Agent[]) => void;
  setMissions: (missions: Mission[]) => void;
  setTasks: (tasks: Task[]) => void;
  setActivity: (events: ActivityEvent[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // UI actions — same API as before, no component changes needed
  selectAgent: (id: string | null) => void;
  selectMission: (id: string | null) => void;
  selectTask: (id: string | null) => void;
  setInspectorOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Kept for backwards compatibility (no-ops now; backend is source of truth)
  addActivity: (event: ActivityEvent) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  updateAgentStatus: (agentId: string, status: Agent['status']) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>((set) => ({
  // Initial state — empty until first poll resolves
  agents: [],
  missions: [],
  tasks: [],
  activity: [],
  systemSummary: null,
  loading: true,
  error: null,

  ui: {
    selectedAgentId: null,
    selectedMissionId: null,
    selectedTaskId: null,
    inspectorOpen: false,
    sidebarCollapsed: false,
  },

  // ── Data setters ───────────────────────────────────────────────────────────

  setAgents: (agents) => set({ agents }),
  setMissions: (missions) =>
    set((state) => ({
      missions,
      // If no mission is selected yet, auto-select the first active one
      ui:
        state.ui.selectedMissionId !== null
          ? state.ui
          : {
              ...state.ui,
              selectedMissionId:
                missions.find((m) => m.status === 'active' || m.status === 'planning')?.id ??
                missions[0]?.id ??
                null,
            },
    })),
  setTasks: (tasks) => set({ tasks }),
  setActivity: (activity) => set({ activity }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // ── UI actions ─────────────────────────────────────────────────────────────

  selectAgent: (id) =>
    set((state) => ({
      ui: {
        ...state.ui,
        selectedAgentId: id,
        inspectorOpen: id !== null,
      },
    })),

  selectMission: (id) =>
    set((state) => ({
      ui: { ...state.ui, selectedMissionId: id },
    })),

  selectTask: (id) =>
    set((state) => ({
      ui: { ...state.ui, selectedTaskId: id },
    })),

  setInspectorOpen: (open) =>
    set((state) => ({
      ui: { ...state.ui, inspectorOpen: open },
    })),

  setSidebarCollapsed: (collapsed) =>
    set((state) => ({
      ui: { ...state.ui, sidebarCollapsed: collapsed },
    })),

  // ── Legacy no-ops (backend is now source of truth) ────────────────────────
  // These are preserved so no component needs to change. The next poll
  // will overwrite any optimistic state with authoritative backend data.

  addActivity: (event) =>
    set((state) => ({
      activity: [event, ...state.activity].slice(0, 100),
    })),

  updateTaskProgress: (_taskId, _progress) => {
    // no-op: handled by backend simulator
  },

  updateAgentStatus: (_agentId, _status) => {
    // no-op: handled by backend
  },
}));

// ─── Selectors — unchanged ────────────────────────────────────────────────────

export const selectActiveAgents = (store: AppStore) =>
  store.agents.filter((a) => a.status !== 'offline');

export const selectAgentById = (id: string) => (store: AppStore) =>
  store.agents.find((a) => a.id === id);

export const selectTasksByMission = (missionId: string) => (store: AppStore) =>
  store.tasks.filter((t) => t.missionId === missionId);

export const selectActiveMissions = (store: AppStore) =>
  store.missions.filter((m) => m.status === 'active' || m.status === 'planning');

// ─── Polling ──────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3_000;   // agents + tasks every 3s
const ACTIVITY_POLL_MS = 4_000;   // activity slightly slower

let pollingActive = false;

export function startPolling(): () => void {
  if (pollingActive) {
    return () => { /* already running */ };
  }
  pollingActive = true;

  let cancelled = false;

  // Stagger the two polling loops slightly so they don't fire simultaneously
  let agentsMissionsTimer: ReturnType<typeof setTimeout>;
  let activityTimer: ReturnType<typeof setTimeout>;

  async function pollAgentsAndMissions() {
    if (cancelled) return;
    try {
      const [agents, { missions, tasks }] = await Promise.all([
        fetchAgents(),
        fetchMissionsWithTasks(),
      ]);
      if (!cancelled) {
        useAppStore.getState().setAgents(agents);
        useAppStore.getState().setMissions(missions);
        useAppStore.getState().setTasks(tasks);
        useAppStore.getState().setLoading(false);
        useAppStore.getState().setError(null);
      }
    } catch (err) {
      if (!cancelled) {
        const msg = err instanceof Error ? err.message : 'API unavailable';
        useAppStore.getState().setError(msg);
        // Keep loading=false even on error so stale data stays visible
        useAppStore.getState().setLoading(false);
      }
    }
    if (!cancelled) {
      agentsMissionsTimer = setTimeout(pollAgentsAndMissions, POLL_INTERVAL_MS);
    }
  }

  async function pollActivity() {
    if (cancelled) return;
    try {
      const activity = await fetchActivity(100);
      if (!cancelled) {
        useAppStore.getState().setActivity(activity);
      }
    } catch {
      // Activity errors are non-critical — silently skip
    }
    if (!cancelled) {
      activityTimer = setTimeout(pollActivity, ACTIVITY_POLL_MS);
    }
  }

  // Kick off both loops (stagger activity by 1s)
  pollAgentsAndMissions();
  activityTimer = setTimeout(pollActivity, 1_000);

  return () => {
    cancelled = true;
    pollingActive = false;
    clearTimeout(agentsMissionsTimer);
    clearTimeout(activityTimer);
  };
}

// ─── Legacy export — shell.tsx imports this ───────────────────────────────────
// Keep the old name so shell.tsx doesn't need to change until we update it.
export const startActivitySimulator = startPolling;
