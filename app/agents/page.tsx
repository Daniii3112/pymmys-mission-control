'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Zap, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import AgentCard from '@/components/agents/agent-card';
import { Badge } from '@/components/ui/badge';
import TaskOutput from '@/components/ui/task-output';
import type { Agent, AgentStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: AgentStatus | 'all' }[] = [
  { label: 'All',    value: 'all'    },
  { label: 'Busy',   value: 'busy'   },
  { label: 'Online', value: 'online' },
  { label: 'Idle',   value: 'idle'   },
];

export default function AgentsPage() {
  const agents = useAppStore((s) => s.agents);
  const tasks = useAppStore((s) => s.tasks);
  const selectedId = useAppStore((s) => s.ui.selectedAgentId);
  const selectAgent = useAppStore((s) => s.selectAgent);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');

  const selectedAgent = agents.find((a) => a.id === selectedId);

  const filtered = agents.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const agentTasks = selectedAgent
    ? tasks.filter((t) => t.assignedAgentId === selectedAgent.id)
    : [];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Header toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents…"
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-xs"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          {/* Status filters */}
          <div
            className="flex items-center gap-1 p-1 rounded-lg"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
          >
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  background: statusFilter === f.value ? 'var(--accent-indigo-dim)' : 'transparent',
                  color: statusFilter === f.value ? '#fff' : 'var(--text-muted)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <SlidersHorizontal size={13} />
            {filtered.length} agents
          </div>
        </div>

        {/* Fleet overview bar */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Agents',  value: agents.length,   color: 'var(--accent-indigo)' },
            { label: 'Online',        value: agents.filter(a => a.status === 'online').length,  color: 'var(--accent-emerald)' },
            { label: 'Busy',          value: agents.filter(a => a.status === 'busy').length,    color: 'var(--accent-amber)' },
            { label: 'Idle',          value: agents.filter(a => a.status === 'idle').length,    color: 'var(--text-muted)' },
          ].map(({ label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg px-4 py-3"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Search size={32} style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No agents match your filters</p>
          </div>
        )}
      </div>

      {/* Inspector panel */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden shrink-0"
            style={{
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-subtle)',
            }}
          >
            <div className="w-[340px] h-full overflow-y-auto">
              {/* Inspector header */}
              <div
                className="flex items-center justify-between px-5 py-4 sticky top-0"
                style={{
                  background: 'var(--bg-surface)',
                  borderBottom: '1px solid var(--border-subtle)',
                  zIndex: 10,
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Inspector
                </span>
                <button
                  onClick={() => selectAgent(null)}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Agent identity */}
                <div className="flex flex-col items-center text-center gap-3 py-4">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl text-3xl relative"
                    style={{
                      background: `${selectedAgent.color}18`,
                      border: `2px solid ${selectedAgent.color}40`,
                      boxShadow: `0 0 24px ${selectedAgent.color}20`,
                    }}
                  >
                    {selectedAgent.avatar}
                    <span
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                      style={{
                        background: selectedAgent.status === 'busy' ? '#f59e0b' : '#10b981',
                        borderColor: 'var(--bg-surface)',
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                      {selectedAgent.name}
                    </h2>
                    <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {selectedAgent.role} · {selectedAgent.department}
                    </p>
                  </div>
                  <Badge status={selectedAgent.status} />
                  <p className="text-xs leading-relaxed text-center" style={{ color: 'var(--text-secondary)' }}>
                    {selectedAgent.description}
                  </p>
                </div>

                {/* Performance */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                    Performance
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <CheckCircle2 size={13} />, label: 'Completed', value: selectedAgent.tasksCompleted.toLocaleString() },
                      { icon: <TrendingUp size={13} />, label: 'Success Rate', value: `${selectedAgent.successRate}%` },
                      { icon: <Clock size={13} />, label: 'Avg Latency', value: `${selectedAgent.avgLatencyMs}ms` },
                      { icon: <Zap size={13} />, label: 'Tokens Used', value: `${(selectedAgent.tokenUsage / 1_000_000).toFixed(1)}M` },
                    ].map(({ icon, label, value }) => (
                      <div
                        key={label}
                        className="rounded-lg p-3"
                        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
                      >
                        <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-muted)' }}>
                          {icon}
                          <span className="text-[10px] uppercase tracking-wider">{label}</span>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                    Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAgent.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-2.5 py-1 rounded-lg"
                        style={{
                          background: `${selectedAgent.color}12`,
                          color: selectedAgent.color,
                          border: `1px solid ${selectedAgent.color}25`,
                        }}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current tasks */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                    Tasks
                  </h4>
                  <div className="space-y-2">
                    {agentTasks.length === 0 ? (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tasks assigned</p>
                    ) : (
                      agentTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="rounded-lg p-3"
                          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium truncate flex-1 min-w-0 mr-2" style={{ color: 'var(--text-primary)' }}>
                              {task.title}
                            </span>
                            <Badge status={task.status} dot={false} size="xs" />
                          </div>
                          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full rounded-full"
                              style={{ background: selectedAgent.color }}
                            />
                          </div>
                          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                            {task.progress}% complete
                          </p>
                          {task.status === 'completed' && task.output && (
                            <TaskOutput output={task.output} accentColor={selectedAgent.color} />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
