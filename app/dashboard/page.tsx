'use client';

import { motion } from 'framer-motion';
import {
  Bot, CheckCircle2, Zap, TrendingUp,
  Crosshair, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import StatsCard from '@/components/dashboard/stats-card';
import ActivityFeed from '@/components/dashboard/activity-feed';
import MissionSummary from '@/components/dashboard/mission-summary';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const agents = useAppStore((s) => s.agents);
  const missions = useAppStore((s) => s.missions);
  const tasks = useAppStore((s) => s.tasks);

  const onlineAgents = agents.filter((a) => a.status !== 'offline');
  const busyAgents   = agents.filter((a) => a.status === 'busy');
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const runningTasks   = tasks.filter((t) => t.status === 'running').length;
  const activeMissions = missions.filter((m) => m.status === 'active').length;
  const totalTokens = agents.reduce((sum, a) => sum + a.tokenUsage, 0);

  const stats = [
    {
      label: 'Active Agents',
      value: onlineAgents.length,
      delta: `${busyAgents.length} busy`,
      deltaPositive: true,
      icon: <Bot size={20} />,
      accentColor: '#818cf8',
    },
    {
      label: 'Tasks Completed',
      value: completedTasks.toLocaleString(),
      delta: `${runningTasks} running`,
      deltaPositive: true,
      icon: <CheckCircle2 size={20} />,
      accentColor: '#10b981',
    },
    {
      label: 'Active Missions',
      value: activeMissions,
      delta: `${missions.length} total`,
      deltaPositive: true,
      icon: <Crosshair size={20} />,
      accentColor: '#22d3ee',
    },
    {
      label: 'Tokens Consumed',
      value: `${(totalTokens / 1_000_000).toFixed(1)}M`,
      delta: '↑ 12%',
      deltaPositive: false,
      icon: <Zap size={20} />,
      accentColor: '#f59e0b',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(34,211,238,0.08) 100%)',
          border: '1px solid rgba(79,70,229,0.3)',
        }}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(129,140,248,0.15) 0%, transparent 60%)',
          }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: '#10b981' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#10b981' }} />
              </span>
              <span className="text-xs font-medium" style={{ color: '#10b981' }}>All systems operational</span>
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Good morning — {agents.filter((a) => a.status === 'busy').length} agents are running tasks
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {activeMissions > 0
                ? `${missions.filter(m => m.status === 'active')[0]?.name ?? 'Active mission'} is at ${missions.filter(m => m.status === 'active')[0]?.progress ?? 0}% completion.`
                : 'No active missions right now.'
              } Estimated delivery in ~2 hours.
            </p>
          </div>
          <Link href="/mission-control">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm"
              style={{
                background: 'rgba(79,70,229,0.3)',
                border: '1px solid rgba(129,140,248,0.4)',
                color: 'var(--accent-indigo)',
              }}
            >
              <Crosshair size={15} />
              Open Mission Control
              <ArrowUpRight size={13} />
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatsCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Missions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Active Missions</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{activeMissions} missions in progress</p>
                </div>
                <Link href="/mission-control" className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--accent-indigo)' }}>
                  View all <ArrowUpRight size={12} />
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              <MissionSummary missions={missions} />
            </CardBody>
          </Card>
        </div>

        {/* Agent quick view */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Agent Fleet</h3>
                <Link href="/agents" className="text-xs flex items-center gap-1"
                  style={{ color: 'var(--accent-indigo)' }}>
                  Manage <ArrowUpRight size={12} />
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div>
                {agents.slice(0, 6).map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-5 py-3 transition-colors"
                    style={{ borderBottom: i < 5 ? '1px solid var(--border-subtle)' : undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      className="relative flex items-center justify-center w-8 h-8 rounded-lg text-base shrink-0"
                      style={{ background: `${agent.color}18`, border: `1px solid ${agent.color}30` }}
                    >
                      {agent.avatar}
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                        style={{
                          background: agent.status === 'online' ? '#10b981'
                            : agent.status === 'busy' ? '#f59e0b'
                            : agent.status === 'idle' ? '#6b7280' : '#f43f5e',
                          borderColor: 'var(--bg-raised)',
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {agent.name}
                      </p>
                      <p className="text-[10px] truncate capitalize" style={{ color: 'var(--text-muted)' }}>
                        {agent.role}
                      </p>
                    </div>
                    <Badge status={agent.status} dot={false} size="xs" />
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Live Activity</h3>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: '#10b981' }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#10b981' }} />
              </span>
            </div>
            <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
          </div>
        </CardHeader>
        <div>
          <ActivityFeed maxItems={8} compact />
        </div>
      </Card>
    </div>
  );
}
