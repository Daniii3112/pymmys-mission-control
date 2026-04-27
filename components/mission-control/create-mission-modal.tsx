'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { createMission, fetchMissionsWithTasks } from '@/lib/api';
import { useAppStore } from '@/lib/store';

// ─── Agent options ────────────────────────────────────────────────────────────

const AGENTS = [
  { id: 'agent-orchestrator', name: 'Pymmys Core' },
  { id: 'agent-researcher',   name: 'Nexus'       },
  { id: 'agent-coder',        name: 'Forge'       },
  { id: 'agent-writer',       name: 'Scribe'      },
  { id: 'agent-analyst',      name: 'Prism'       },
  { id: 'agent-reviewer',     name: 'Sentinel'    },
  { id: 'agent-planner',      name: 'Blueprint'   },
  { id: 'agent-executor',     name: 'Axiom'       },
] as const;

const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskDraft {
  title: string;
  assigned_agent_id: string;
  priority: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 6,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateMissionModal({ isOpen, onClose }: Props) {
  const [name, setName]             = useState('');
  const [objective, setObjective]   = useState('');
  const [description, setDesc]      = useState('');
  const [tagsRaw, setTagsRaw]       = useState('');
  const [tasks, setTasks]           = useState<TaskDraft[]>([
    { title: '', assigned_agent_id: 'agent-planner', priority: 'medium' },
  ]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  function reset() {
    setName(''); setObjective(''); setDesc(''); setTagsRaw('');
    setTasks([{ title: '', assigned_agent_id: 'agent-planner', priority: 'medium' }]);
    setLoading(false); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  function addTask() {
    if (tasks.length >= 8) return;
    setTasks((prev) => [...prev, { title: '', assigned_agent_id: 'agent-executor', priority: 'medium' }]);
  }

  function removeTask(i: number) {
    setTasks((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateTask(i: number, patch: Partial<TaskDraft>) {
    setTasks((prev) => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validTasks = tasks.filter((t) => t.title.trim());
    if (!name.trim()) { setError('Mission name is required.'); return; }
    if (validTasks.length === 0) { setError('Add at least one task with a title.'); return; }

    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const agentIds = [...new Set(validTasks.map((t) => t.assigned_agent_id))];

    setLoading(true);
    try {
      await createMission({
        name: name.trim(),
        objective: objective.trim(),
        description: description.trim(),
        status: 'planning',
        agent_ids: agentIds,
        tags,
        tasks: validTasks.map((t) => ({
          title: t.title.trim(),
          description: '',
          priority: t.priority,
          assigned_agent_id: t.assigned_agent_id,
          tags: [],
        })),
      });

      // Immediately refresh store so the new mission appears
      const { missions, tasks: updatedTasks } = await fetchMissionsWithTasks();
      useAppStore.getState().setMissions(missions);
      useAppStore.getState().setTasks(updatedTasks);

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mission.');
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full overflow-y-auto rounded-xl flex flex-col"
              style={{
                maxWidth: 560,
                maxHeight: '90vh',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    New Mission
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Define a mission and its task chain
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
                <div className="px-5 py-5 space-y-4 flex-1">

                  {/* Mission Name */}
                  <div>
                    <label style={labelStyle}>Mission Name *</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Project Nightfall"
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    />
                  </div>

                  {/* Objective */}
                  <div>
                    <label style={labelStyle}>Objective</label>
                    <textarea
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="What is the end goal of this mission?"
                      rows={2}
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Additional context for this mission"
                      rows={2}
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label style={labelStyle}>Tags</label>
                    <input
                      value={tagsRaw}
                      onChange={(e) => setTagsRaw(e.target.value)}
                      placeholder="research, high-priority, q2 (comma-separated)"
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    />
                  </div>

                  {/* Tasks section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label style={{ ...labelStyle, marginBottom: 0 }}>
                        Tasks ({tasks.length}/8)
                      </label>
                      <button
                        type="button"
                        onClick={addTask}
                        disabled={tasks.length >= 8}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
                        style={{
                          background: tasks.length >= 8 ? 'rgba(255,255,255,0.04)' : 'rgba(129,140,248,0.12)',
                          color: tasks.length >= 8 ? 'var(--text-muted)' : 'var(--accent-indigo)',
                          border: `1px solid ${tasks.length >= 8 ? 'transparent' : 'rgba(129,140,248,0.25)'}`,
                          cursor: tasks.length >= 8 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Plus size={11} />
                        Add Task
                      </button>
                    </div>

                    <div className="space-y-2">
                      {tasks.map((task, i) => (
                        <div
                          key={i}
                          className="rounded-lg p-3"
                          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
                        >
                          <div className="flex items-center gap-2 mb-2.5">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider shrink-0"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Task {i + 1}
                            </span>
                            <div className="flex-1" />
                            <button
                              type="button"
                              onClick={() => removeTask(i)}
                              className="p-1 rounded transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="space-y-2">
                            {/* Title */}
                            <input
                              value={task.title}
                              onChange={(e) => updateTask(i, { title: e.target.value })}
                              placeholder="Task title"
                              style={{ ...inputStyle, fontSize: 12, padding: '6px 10px' }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)')}
                              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                            />

                            <div className="grid grid-cols-2 gap-2">
                              {/* Agent */}
                              <div>
                                <span style={{ ...labelStyle, fontSize: 9 }}>Agent</span>
                                <select
                                  value={task.assigned_agent_id}
                                  onChange={(e) => updateTask(i, { assigned_agent_id: e.target.value })}
                                  style={{
                                    ...inputStyle,
                                    fontSize: 12,
                                    padding: '6px 10px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {AGENTS.map((a) => (
                                    <option key={a.id} value={a.id}
                                      style={{ background: '#1a1f2e', color: 'var(--text-primary)' }}>
                                      {a.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Priority */}
                              <div>
                                <span style={{ ...labelStyle, fontSize: 9 }}>Priority</span>
                                <select
                                  value={task.priority}
                                  onChange={(e) => updateTask(i, { priority: e.target.value })}
                                  style={{
                                    ...inputStyle,
                                    fontSize: 12,
                                    padding: '6px 10px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {PRIORITIES.map((p) => (
                                    <option key={p} value={p}
                                      style={{ background: '#1a1f2e', color: 'var(--text-primary)' }}>
                                      {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <p
                      className="text-xs rounded-lg px-3 py-2"
                      style={{
                        color: '#f43f5e',
                        background: 'rgba(244,63,94,0.08)',
                        border: '1px solid rgba(244,63,94,0.2)',
                      }}
                    >
                      {error}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-end gap-3 px-5 py-4 shrink-0"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: loading ? 'rgba(79,70,229,0.4)' : 'rgba(79,70,229,0.9)',
                      border: '1px solid rgba(129,140,248,0.4)',
                      color: '#fff',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.background = 'rgba(79,70,229,1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.currentTarget.style.background = 'rgba(79,70,229,0.9)';
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"
                        />
                        Creating…
                      </>
                    ) : (
                      'Create Mission'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
