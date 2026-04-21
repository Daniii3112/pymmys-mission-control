'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Mission } from '@/types';

interface MissionSummaryProps {
  missions: Mission[];
}

export default function MissionSummary({ missions }: MissionSummaryProps) {
  return (
    <div className="flex flex-col gap-2">
      {missions.map((mission, i) => (
        <motion.div
          key={mission.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors"
          style={{ border: '1px solid var(--border-subtle)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)';
          }}
        >
          {/* Status */}
          <Badge status={mission.status} size="xs" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {mission.name}
              </span>
            </div>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {mission.agentIds.length} agents · {mission.taskIds.length} tasks
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {mission.progress}%
              </span>
              <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mission.progress}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: mission.progress === 100
                      ? 'var(--accent-emerald)'
                      : mission.status === 'active'
                        ? 'linear-gradient(90deg, var(--accent-indigo-dim), var(--accent-indigo))'
                        : 'var(--accent-amber)',
                  }}
                />
              </div>
            </div>
            <Link href="/mission-control">
              <ArrowUpRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
