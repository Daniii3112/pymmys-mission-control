import type { AgentStatus, TaskStatus, MissionStatus, TaskPriority } from '@/types';

const statusConfig = {
  // Agent status
  online:    { label: 'Online',    bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
  busy:      { label: 'Busy',      bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  idle:      { label: 'Idle',      bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' },
  error:     { label: 'Error',     bg: 'rgba(244,63,94,0.12)',   color: '#f43f5e' },
  offline:   { label: 'Offline',   bg: 'rgba(75,85,99,0.12)',    color: '#6b7280' },
  // Task status
  queued:    { label: 'Queued',    bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' },
  running:   { label: 'Running',   bg: 'rgba(129,140,248,0.12)', color: '#818cf8' },
  completed: { label: 'Done',      bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
  failed:    { label: 'Failed',    bg: 'rgba(244,63,94,0.12)',   color: '#f43f5e' },
  paused:    { label: 'Paused',    bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  // Mission status
  active:    { label: 'Active',    bg: 'rgba(34,211,238,0.12)',  color: '#22d3ee' },
  planning:  { label: 'Planning',  bg: 'rgba(251,146,60,0.12)',  color: '#fb923c' },
  // Priority
  critical:  { label: 'Critical',  bg: 'rgba(244,63,94,0.15)',   color: '#f43f5e' },
  high:      { label: 'High',      bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  medium:    { label: 'Medium',    bg: 'rgba(129,140,248,0.12)', color: '#818cf8' },
  low:       { label: 'Low',       bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' },
} as const;

type BadgeKey = AgentStatus | TaskStatus | MissionStatus | TaskPriority;

interface BadgeProps {
  status: BadgeKey;
  dot?: boolean;
  size?: 'xs' | 'sm';
}

export function Badge({ status, dot = true, size = 'sm' }: BadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.offline;
  const textSize = size === 'xs' ? 'text-[9px]' : 'text-[10px]';
  const padding = size === 'xs' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider ${textSize} ${padding}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: cfg.color }}
        />
      )}
      {cfg.label}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: TaskPriority }) {
  const cfg = statusConfig[priority];
  return (
    <span
      className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
      title={priority}
    />
  );
}
