'use client';

import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Agent } from '@/types';
import { useAppStore } from '@/lib/store';

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

const roleLabels: Record<Agent['role'], string> = {
  orchestrator: 'Orchestrator',
  researcher: 'Researcher',
  writer: 'Writer',
  coder: 'Coder',
  analyst: 'Analyst',
  reviewer: 'Reviewer',
  planner: 'Planner',
  executor: 'Executor',
};

interface AgentCardProps {
  agent: Agent;
  index?: number;
}

export default function AgentCard({ agent, index = 0 }: AgentCardProps) {
  const selectAgent = useAppStore((s) => s.selectAgent);
  const selectedId = useAppStore((s) => s.ui.selectedAgentId);
  const isSelected = selectedId === agent.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => selectAgent(isSelected ? null : agent.id)}
      className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--bg-raised)',
        border: isSelected
          ? `1px solid ${agent.color}60`
          : '1px solid var(--border-subtle)',
        boxShadow: isSelected ? `0 0 20px ${agent.color}15` : 'none',
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Top glow accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: isSelected
            ? `linear-gradient(90deg, transparent, ${agent.color}, transparent)`
            : 'transparent',
          transition: 'background 0.3s',
        }}
      />

      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: agent.color,
          opacity: isSelected ? 0.06 : 0,
          transform: 'translate(40%, -40%)',
        }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
                style={{
                  background: `${agent.color}18`,
                  border: `1px solid ${agent.color}30`,
                }}
              >
                {agent.avatar}
              </div>
              {/* Status dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                style={{
                  background: agent.status === 'online' ? '#10b981'
                    : agent.status === 'busy' ? '#f59e0b'
                    : agent.status === 'idle' ? '#6b7280'
                    : '#f43f5e',
                  borderColor: 'var(--bg-raised)',
                }}
              >
                {agent.status === 'busy' && (
                  <span
                    className="absolute w-full h-full rounded-full animate-ping opacity-60"
                    style={{ background: '#f59e0b' }}
                  />
                )}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {agent.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {roleLabels[agent.role]}
              </p>
            </div>
          </div>

          <Badge status={agent.status} />
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {agent.description}
        </p>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="text-[10px] px-2 py-0.5 rounded-md font-medium"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-md"
              style={{ color: 'var(--text-muted)' }}>
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Stat icon={<CheckCircle2 size={11} />} label="Done" value={agent.tasksCompleted.toLocaleString()} color={agent.color} />
          <Stat icon={<TrendingUp size={11} />} label="Rate" value={`${agent.successRate}%`} color={agent.color} />
          <Stat icon={<Clock size={11} />} label="Latency" value={`${agent.avgLatencyMs}ms`} color={agent.color} />
          <Stat icon={<Zap size={11} />} label="Tokens" value={formatTokens(agent.tokenUsage)} color={agent.color} />
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
        {icon}
        <span className="text-[9px] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
