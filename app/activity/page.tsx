'use client';

import { motion } from 'framer-motion';
import ActivityFeed from '@/components/dashboard/activity-feed';
import { useAppStore } from '@/lib/store';

export default function ActivityPage() {
  const activity = useAppStore((s) => s.activity);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Live Event Stream</h2>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: '#10b981' }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#10b981' }} />
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {activity.length} events
          </span>
        </div>
        <ActivityFeed maxItems={100} />
      </motion.div>
    </div>
  );
}
