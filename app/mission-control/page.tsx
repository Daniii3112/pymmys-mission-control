'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, ChevronDown, Bot, Zap, BarChart3, LayoutGrid } from 'lucide-react';
import HQMap from '@/components/mission-control/hq-map';
import InspectorPanel from '@/components/mission-control/inspector-panel';
import LiveTicker from '@/components/mission-control/live-ticker';
import ActivityFeed from '@/components/dashboard/activity-feed';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

type ViewMode = 'hq' | 'activity';

export default function MissionControlPage() {
  const agents = useAppStore((s) => s.agents);
  const missions = useAppStore((s) => s.missions);
  const tasks = useAppStore((s) => s.tasks);
  const selectedMissionId = useAppStore((s) => s.ui.selectedMissionId);
  const selectMission = useAppStore((s) => s.selectMission);
  const [viewMode, setViewMode] = useState<ViewMode>('hq');

  const selectedMission = missions.find((m) => m.id === selectedMissionId);
  const activeMissions = missions.filter((m) => m.status === 'active');
  const runningTasks = tasks.filter((t) => t.status === 'running').length;
  const busyAgents = agents.filter((a) => a.status === 'busy').length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mission Control Header Bar */}
      <div
        className="flex items-center gap-4 px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        {/* Mission selector */}
        <div className="flex items-center gap-2">
          <Crosshair size={14} style={{ color: 'var(--accent-indigo)' }} />
          <div className="flex items-center gap-1">
            {missions.filter(m => m.status === 'active' || m.status === 'planning').map((m) => (
              <button
                key={m.id}
                onClick={() => selectMission(m.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: m.id === selectedMissionId ? 'rgba(79,70,229,0.15)' : 'transparent',
                  border: m.id === selectedMissionId ? '1px solid rgba(129,140,248,0.3)' : '1px solid transparent',
                  color: m.id === selectedMissionId ? 'var(--accent-indigo)' : 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  if (m.id !== selectedMissionId) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (m.id !== selectedMissionId) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {m.name}
                <Badge status={m.status} dot={false} size="xs" />
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-4 shrink-0" style={{ background: 'var(--border-subtle)' }} />

        {/* System stats */}
        <div className="flex items-center gap-4 flex-1">
          <StatChip icon={<Bot size={12} />} value={busyAgents} label="active agents" color="var(--accent-amber)" />
          <StatChip icon={<Zap size={12} />} value={runningTasks} label="running tasks" color="var(--accent-indigo)" />
          <StatChip icon={<BarChart3 size={12} />} value={`${selectedMission?.progress ?? 0}%`} label="mission progress" color="var(--accent-emerald)" />
        </div>

        {/* View toggle */}
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
        >
          <ViewBtn active={viewMode === 'hq'} onClick={() => setViewMode('hq')} icon={<LayoutGrid size={13} />} label="HQ Map" />
          <ViewBtn active={viewMode === 'activity'} onClick={() => setViewMode('activity')} icon={<BarChart3 size={13} />} label="Activity" />
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">

        {/* Center canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === 'hq' ? (
              <motion.div
                key="hq"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 relative overflow-hidden"
                style={{ background: 'var(--bg-base)' }}
              >
                <HQMap />

                {/* Floating legend */}
                <div
                  className="absolute bottom-12 left-4 rounded-lg p-3 flex flex-col gap-2"
                  style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }}
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Legend</p>
                  {[
                    { color: '#10b981', label: 'Online' },
                    { color: '#f59e0b', label: 'Busy (active task)' },
                    { color: '#6b7280', label: 'Idle' },
                    { color: '#818cf8', label: 'Data flow' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Floating agent count */}
                <div
                  className="absolute top-4 left-4 rounded-lg px-3 py-2 flex items-center gap-2"
                  style={{ background: 'rgba(13,17,23,0.85)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#10b981' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#10b981' }} />
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {agents.length} agents deployed
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
                  <span className="text-xs" style={{ color: 'var(--accent-amber)' }}>
                    {busyAgents} processing
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="activity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
                style={{ background: 'var(--bg-base)' }}
              >
                <div className="max-w-2xl mx-auto py-6 px-4">
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
                  >
                    <div className="px-5 py-4 flex items-center gap-2"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Event Stream</h3>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#10b981' }} />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#10b981' }} />
                      </span>
                    </div>
                    <ActivityFeed maxItems={50} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live ticker at bottom */}
          <LiveTicker />
        </div>

        {/* Right inspector */}
        <InspectorPanel />
      </div>
    </div>
  );
}

function StatChip({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color }}>{icon}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
      style={{
        background: active ? 'var(--accent-indigo-dim)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
