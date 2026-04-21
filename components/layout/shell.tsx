'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './sidebar';
import Topbar from './topbar';
import { startPolling } from '@/lib/store';
import { useAppStore } from '@/lib/store';

function LoadingOverlay() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-2xl mb-4 animate-glow-pulse"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        Connecting to Mission Control…
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Fetching agent fleet and missions
      </p>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);

  useEffect(() => {
    const cleanup = startPolling();
    return cleanup;
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {loading && <LoadingOverlay />}

      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />

        {error && (
          <div
            className="flex items-center gap-2 px-4 py-2 text-xs shrink-0"
            style={{
              background: 'rgba(244,63,94,0.1)',
              borderBottom: '1px solid rgba(244,63,94,0.2)',
              color: '#f43f5e',
            }}
          >
            <span>⚠</span>
            <span>Backend unreachable — showing last known data. ({error})</span>
          </div>
        )}

        <motion.main
          className="flex-1 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
