'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Cpu, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':       { title: 'Dashboard',       subtitle: 'System overview and KPIs' },
  '/agents':          { title: 'Agents',           subtitle: 'Manage and monitor your agent fleet' },
  '/mission-control': { title: 'Mission Control',  subtitle: 'Live HQ — all agents, all missions' },
  '/activity':        { title: 'Activity',         subtitle: 'Real-time event stream' },
};

export default function Topbar() {
  const pathname = usePathname();
  const agents = useAppStore((s) => s.agents);
  const page = pageTitles[pathname] ?? { title: 'Pymmys HQ', subtitle: '' };

  const onlineCount = agents.filter((a) => a.status !== 'offline').length;
  const busyCount   = agents.filter((a) => a.status === 'busy').length;

  return (
    <header
      className="flex items-center justify-between px-6 h-14 shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Page title */}
      <div className="flex flex-col">
        <motion.h1
          key={pathname}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {page.title}
        </motion.h1>
        <motion.p
          key={pathname + '-sub'}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {page.subtitle}
        </motion.p>
      </div>

      {/* Center — search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm w-64"
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        <Search size={13} />
        <span className="text-xs">Search agents, tasks…</span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
        >⌘K</span>
      </div>

      {/* Right — system stats */}
      <div className="flex items-center gap-4">
        <StatusPill icon={<Cpu size={12} />} label={`${onlineCount} active`} color="var(--accent-emerald)" />
        <StatusPill icon={<TrendingUp size={12} />} label={`${busyCount} running`} color="var(--accent-amber)" />

        {/* Live dot */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: 'var(--accent-emerald)' }} />
            <span className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: 'var(--accent-emerald)' }} />
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--accent-emerald)' }}>Live</span>
        </div>
      </div>
    </header>
  );
}

function StatusPill({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color }}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}
