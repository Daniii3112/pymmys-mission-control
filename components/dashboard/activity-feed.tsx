'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, CheckCircle2, XCircle, Radio, ArrowRightLeft,
  Wrench, MessageSquare, AlertTriangle,
} from 'lucide-react';
import type { ActivityEvent, ActivityType } from '@/types';
import { useAppStore } from '@/lib/store';
import { useMemo, useRef } from "react";

const iconMap: Record<ActivityType, React.ReactNode> = {
  task_started:   <Zap size={13} />,
  task_completed: <CheckCircle2 size={13} />,
  task_failed:    <XCircle size={13} />,
  agent_online:   <Radio size={13} />,
  agent_offline:  <Radio size={13} />,
  message_sent:   <MessageSquare size={13} />,
  tool_call:      <Wrench size={13} />,
  handoff:        <ArrowRightLeft size={13} />,
  error:          <AlertTriangle size={13} />,
};

const colorMap: Record<ActivityType, string> = {
  task_started:   '#818cf8',
  task_completed: '#10b981',
  task_failed:    '#f43f5e',
  agent_online:   '#22d3ee',
  agent_offline:  '#6b7280',
  message_sent:   '#a78bfa',
  tool_call:      '#f59e0b',
  handoff:        '#06b6d4',
  error:          '#f43f5e',
};

function timeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  return `${Math.floor(sec / 3600)}h`;
}

interface ActivityFeedProps {
  maxItems?: number;
  compact?: boolean;
}

export default function ActivityFeed({ maxItems = 20, compact = false }: ActivityFeedProps) {
  const activity = useAppStore((s) => s.activity);
  const visibleActivity = useMemo(() => activity.slice(0, maxItems), [activity, maxItems]);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto"
      style={{ maxHeight: compact ? '280px' : '100%' }}
    >
      <AnimatePresence initial={false}>
        {visibleActivity.map((event) => (
          <ActivityRow key={event.id} event={event} compact={compact} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ActivityRow({ event, compact }: { event: ActivityEvent; compact?: boolean }) {
  const color = colorMap[event.type] ?? '#8b949e';
  const icon = iconMap[event.type] ?? <Zap size={13} />;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 group ${compact ? 'px-4 py-2.5' : 'px-5 py-3'} transition-colors`}
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Icon */}
      <div
        className="mt-0.5 flex items-center justify-center w-6 h-6 rounded-md shrink-0"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {event.agentName}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: `${color}14`, color }}
          >
            {event.type.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="text-xs leading-relaxed truncate" style={{ color: 'var(--text-secondary)' }}>
          {event.message}
        </p>
      </div>

      {/* Time */}
      <span className="text-[10px] shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
        {timeAgo(event.timestamp)}
      </span>
    </motion.div>
  );
}
