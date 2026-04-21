'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AgentNode from './agent-node';
import TaskConnections from './task-connections';
import { useAppStore } from '@/lib/store';

// Department zones — purely decorative background regions
const departments = [
  { id: 'command',   label: 'COMMAND',       x: 38, y: 30, w: 24, h: 30, color: '#818cf8' },
  { id: 'intel',     label: 'INTELLIGENCE',  x: 6,  y: 10, w: 28, h: 40, color: '#22d3ee' },
  { id: 'eng',       label: 'ENGINEERING',   x: 66, y: 10, w: 28, h: 40, color: '#f59e0b' },
  { id: 'comms',     label: 'COMMS',         x: 6,  y: 56, w: 28, h: 34, color: '#10b981' },
  { id: 'analytics', label: 'ANALYTICS',     x: 66, y: 56, w: 28, h: 34, color: '#a78bfa' },
  { id: 'qa',        label: 'QA',            x: 38, y: 66, w: 24, h: 24, color: '#f43f5e' },
];

export default function HQMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });
  const agents = useAppStore((s) => s.agents);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDims({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <svg
        width={dims.w}
        height={dims.h}
        className="absolute inset-0"
        style={{ background: 'transparent' }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2535" strokeWidth="0.5" />
          </pattern>
          {/* Subtle dot grid */}
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="#1e2535" />
          </pattern>
          {departments.map((d) => (
            <radialGradient key={d.id} id={`glow-${d.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={d.color} stopOpacity="0.06" />
              <stop offset="100%" stopColor={d.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Background grid */}
        <rect width={dims.w} height={dims.h} fill="url(#dots)" />

        {/* Department zones */}
        {departments.map((d) => {
          const x = (d.x / 100) * dims.w;
          const y = (d.y / 100) * dims.h;
          const w = (d.w / 100) * dims.w;
          const h = (d.h / 100) * dims.h;
          return (
            <g key={d.id}>
              <rect
                x={x} y={y} width={w} height={h}
                rx={8}
                fill={`url(#glow-${d.id})`}
                stroke={d.color}
                strokeWidth={1}
                strokeOpacity={0.15}
                strokeDasharray="4 4"
              />
              <text
                x={x + 8}
                y={y + 14}
                fontSize={9}
                fontWeight={700}
                fill={d.color}
                opacity={0.5}
                letterSpacing={1.5}
                fontFamily="var(--font-geist-mono), monospace"
                style={{ userSelect: 'none' }}
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Task flow connections (rendered below nodes) */}
        <TaskConnections containerWidth={dims.w} containerHeight={dims.h} />

        {/* Agent nodes */}
        {agents.map((agent) => (
          <AgentNode
            key={agent.id}
            agent={agent}
            containerWidth={dims.w}
            containerHeight={dims.h}
          />
        ))}
      </svg>
    </div>
  );
}
