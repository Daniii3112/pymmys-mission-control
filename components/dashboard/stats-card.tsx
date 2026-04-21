'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon: ReactNode;
  accentColor: string;
  index?: number;
}

export default function StatsCard({ label, value, delta, deltaPositive, icon, accentColor, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="relative rounded-xl p-5 overflow-hidden"
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: accentColor, transform: 'translate(30%, -30%)' }}
      />

      <div className="flex items-start justify-between relative">
        {/* Icon */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          {icon}
        </div>

        {/* Delta */}
        {delta && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: deltaPositive ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
              color: deltaPositive ? '#10b981' : '#f43f5e',
            }}
          >
            {deltaPositive ? '+' : ''}{delta}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}
