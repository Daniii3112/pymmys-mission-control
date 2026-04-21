'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CheckCircle2, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Badge, PriorityDot } from '@/components/ui/badge';
import TaskOutput from '@/components/ui/task-output';
import { useAppStore } from '@/lib/store';

export default function InspectorPanel() {
  const agents = useAppStore((s) => s.agents);
  const tasks  = useAppStore((s) => s.tasks);
  const missions = useAppStore((s) => s.missions);
  const selectedId = useAppStore((s) => s.ui.selectedAgentId);
  const selectedMissionId = useAppStore((s) => s.ui.selectedMissionId);
  const selectAgent = useAppStore((s) => s.selectAgent);
  const selectMission = useAppStore((s) => s.selectMission);

  const agent = agents.find((a) => a.id === selectedId);
  const mission = missions.find((m) => m.id === selectedMissionId);
  const missionTasks = tasks.filter((t) => t.missionId === selectedMissionId);
  const agentTasks = agent ? tasks.filter((t) => t.assignedAgentId === agent.id) : [];

  return (
    <motion.aside
      className="h-full overflow-y-auto shrink-0"
      style={{
        width: 300,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
      }}
    >
      {/* Agent inspector */}
      <AnimatePresence mode="wait">
        {agent ? (
          <motion.div
            key="agent-inspector"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 sticky top-0"
              style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', zIndex: 10 }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Agent Inspector
              </span>
              <button
                onClick={() => selectAgent(null)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={13} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Identity */}
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: `${agent.color}0a`, border: `1px solid ${agent.color}20` }}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-3 relative"
                  style={{
                    background: `${agent.color}18`,
                    border: `2px solid ${agent.color}40`,
                    boxShadow: `0 0 20px ${agent.color}20`,
                  }}
                >
                  {agent.avatar}
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                    style={{
                      background: agent.status === 'busy' ? '#f59e0b'
                        : agent.status === 'online' ? '#10b981'
                        : '#6b7280',
                      borderColor: 'var(--bg-surface)',
                    }}
                  />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{agent.name}</h3>
                <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>{agent.role} · {agent.department}</p>
                <div className="mt-2 flex justify-center">
                  <Badge status={agent.status} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <CheckCircle2 size={11} />, label: 'Completed',   value: agent.tasksCompleted.toLocaleString() },
                  { icon: <TrendingUp size={11} />,   label: 'Success Rate', value: `${agent.successRate}%`              },
                  { icon: <Clock size={11} />,        label: 'Avg Latency',  value: `${agent.avgLatencyMs}ms`            },
                  { icon: <Zap size={11} />,          label: 'Tokens',       value: `${(agent.tokenUsage/1e6).toFixed(1)}M` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="rounded-lg p-2.5"
                    style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-1 mb-1" style={{ color: 'var(--text-muted)' }}>
                      {icon}
                      <span className="text-[9px] uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Active tasks */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Active Tasks ({agentTasks.filter(t => t.status === 'running').length})
                </h4>
                <div className="space-y-1.5">
                  {agentTasks.filter(t => t.status === 'running' || t.status === 'queued').map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg p-3"
                      style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <PriorityDot priority={task.priority} />
                        <span className="text-[11px] font-medium leading-snug flex-1" style={{ color: 'var(--text-primary)' }}>
                          {task.title}
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                        <motion.div
                          animate={{ width: `${task.progress}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ background: agent.color }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{task.progress}%</span>
                        <Badge status={task.status} dot={false} size="xs" />
                      </div>
                    </div>
                  ))}
                  {agentTasks.filter(t => t.status === 'running' || t.status === 'queued').length === 0 && (
                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No active tasks</p>
                  )}
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Capabilities
                </h4>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-[10px] px-2 py-0.5 rounded-md"
                      style={{ background: `${agent.color}12`, color: agent.color, border: `1px solid ${agent.color}20` }}
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Mission inspector */
          <motion.div
            key="mission-inspector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 sticky top-0"
              style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', zIndex: 10 }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Mission Intel
              </span>
              {mission && <Badge status={mission.status} dot size="xs" />}
            </div>

            {mission ? (
              <div className="p-4 space-y-4">
                {/* Mission header */}
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{mission.name}</h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{mission.description}</p>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--accent-indigo)' }}>{mission.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                    <motion.div
                      animate={{ width: `${mission.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, var(--accent-indigo-dim), var(--accent-indigo))' }}
                    />
                  </div>
                </div>

                {/* Objective */}
                <div
                  className="rounded-lg p-3 text-xs leading-relaxed"
                  style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', color: 'var(--text-secondary)' }}
                >
                  <span className="block text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent-indigo)' }}>
                    Objective
                  </span>
                  {mission.objective}
                </div>

                {/* Mission selector */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                    Switch Mission
                  </h4>
                  <div className="space-y-1">
                    {missions.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => selectMission(m.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
                        style={{
                          background: m.id === selectedMissionId ? 'rgba(79,70,229,0.12)' : 'transparent',
                          border: m.id === selectedMissionId ? '1px solid rgba(79,70,229,0.3)' : '1px solid transparent',
                          color: m.id === selectedMissionId ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          if (m.id !== selectedMissionId) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseLeave={(e) => {
                          if (m.id !== selectedMissionId) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        }}
                      >
                        <span className="text-xs font-medium flex-1 truncate">{m.name}</span>
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>{m.progress}%</span>
                        <ChevronRight size={11} className="shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tasks */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                    Task Queue ({missionTasks.length})
                  </h4>
                  <div className="space-y-1.5">
                    {missionTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-lg p-2.5"
                        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
                      >
                        <div className="flex items-start gap-2.5">
                          <PriorityDot priority={task.priority} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              {task.title}
                            </p>
                            {task.status === 'running' && (
                              <div className="mt-1.5 w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                                <motion.div
                                  animate={{ width: `${task.progress}%` }}
                                  transition={{ duration: 0.5 }}
                                  className="h-full rounded-full"
                                  style={{ background: 'var(--accent-indigo)' }}
                                />
                              </div>
                            )}
                          </div>
                          <Badge status={task.status} dot={false} size="xs" />
                        </div>
                        {task.status === 'completed' && task.output && (
                          <TaskOutput output={task.output} accentColor="#10b981" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {mission.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mission.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click an agent to inspect</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
