'use client';

import { motion } from 'framer-motion';
import type { Agent } from '@/types';
import { useAppStore } from '@/lib/store';

interface AgentNodeProps {
  agent: Agent;
  containerWidth: number;
  containerHeight: number;
}

const statusPulseColor: Record<Agent['status'], string> = {
  online:  '#10b981',
  busy:    '#f59e0b',
  idle:    '#6b7280',
  error:   '#f43f5e',
  offline: '#374151',
};

export default function AgentNode({ agent, containerWidth, containerHeight }: AgentNodeProps) {
  const selectAgent = useAppStore((s) => s.selectAgent);
  const selectedId = useAppStore((s) => s.ui.selectedAgentId);
  const isSelected = selectedId === agent.id;

  const x = (agent.position.x / 100) * containerWidth;
  const y = (agent.position.y / 100) * containerHeight;
  const pulseColor = statusPulseColor[agent.status];

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 0.05 * Math.random() * 5 }}
      onClick={() => selectAgent(isSelected ? null : agent.id)}
      style={{ cursor: 'pointer' }}
    >
      {/* Pulse ring (busy only) */}
      {agent.status === 'busy' && (
        <>
          <motion.circle
            cx={x} cy={y} r={24}
            fill="none"
            stroke={pulseColor}
            strokeWidth={1.5}
            opacity={0}
            animate={{
              r: [24, 40],
              opacity: [0.6, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={x} cy={y} r={24}
            fill="none"
            stroke={pulseColor}
            strokeWidth={1}
            opacity={0}
            animate={{
              r: [24, 44],
              opacity: [0.4, 0],
            }}
            transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}

      {/* Outer glow */}
      {isSelected && (
        <motion.circle
          cx={x} cy={y} r={30}
          fill="none"
          stroke={agent.color}
          strokeWidth={2}
          opacity={0.5}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Background circle */}
      <motion.circle
        cx={x}
        cy={y}
        r={22}
        fill={isSelected ? `${agent.color}25` : '#161b22'}
        stroke={isSelected ? agent.color : '#2a3447'}
        strokeWidth={isSelected ? 2 : 1.5}
        animate={isSelected ? { filter: [`drop-shadow(0 0 8px ${agent.color})`, `drop-shadow(0 0 16px ${agent.color})`, `drop-shadow(0 0 8px ${agent.color})`] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Avatar text */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {agent.avatar}
      </text>

      {/* Status dot */}
      <circle
        cx={x + 15}
        cy={y - 15}
        r={5}
        fill={pulseColor}
        stroke="#0d1117"
        strokeWidth={1.5}
      />

      {/* Name label */}
      <text
        x={x}
        y={y + 32}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        fill={isSelected ? agent.color : '#8b949e'}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
        fontFamily="var(--font-geist-sans), system-ui"
      >
        {agent.name}
      </text>

      {/* Active task count */}
      {agent.tasksActive > 0 && (
        <g>
          <circle cx={x - 14} cy={y - 14} r={8} fill="#1c2230" stroke="#2a3447" strokeWidth={1} />
          <text
            x={x - 14}
            y={y - 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={8}
            fontWeight={700}
            fill="#f59e0b"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {agent.tasksActive}
          </text>
        </g>
      )}
    </motion.g>
  );
}
