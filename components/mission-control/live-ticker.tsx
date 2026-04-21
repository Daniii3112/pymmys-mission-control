'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useMemo } from "react";
import { Terminal } from 'lucide-react';

const typeColors: Record<string, string> = {
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
  if (sec < 60) return `${sec}s ago`;
  return `${Math.floor(sec / 60)}m ago`;
}

export default function LiveTicker() {
  const activity = useAppStore((s) => s.activity);
  const visibleActivity = useMemo(() => activity.slice(0, 4), [activity]);

  return (
    <div
      className="flex items-center gap-0 h-9 overflow-hidden"
      style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)' }}
    >
      <div
        className="flex items-center gap-2 px-4 h-full shrink-0"
        style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <Terminal size={11} style={{ color: 'var(--accent-indigo)' }} />
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-indigo)' }}>
          LIVE
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {activity.slice(0, 1).map((event) => {
            const color = typeColors[event.type] ?? '#8b949e';
            return (
              <motion.div
                key={event.id}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 px-4 h-9"
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: `${color}18`, color }}
                >
                  {event.type.replace(/_/g, '·')}
                </span>
                <span className="text-[11px] font-medium shrink-0" style={{ color }}>
                  {event.agentName}
                </span>
                <span className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                  {event.message}
                </span>
                <span className="text-[9px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {timeAgo(event.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
