'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

interface TaskConnectionsProps {
  containerWidth: number;
  containerHeight: number;
}

// Pairs to draw connections between (agent IDs that have active communication)
const connectionPairs = [
  { from: 'agent-orchestrator', to: 'agent-researcher', active: true  },
  { from: 'agent-orchestrator', to: 'agent-coder',      active: true  },
  { from: 'agent-orchestrator', to: 'agent-planner',    active: false },
  { from: 'agent-orchestrator', to: 'agent-executor',   active: true  },
  { from: 'agent-researcher',   to: 'agent-analyst',    active: true  },
  { from: 'agent-analyst',      to: 'agent-writer',     active: false },
  { from: 'agent-coder',        to: 'agent-reviewer',   active: false },
  { from: 'agent-planner',      to: 'agent-writer',     active: false },
];

interface ConnectionProps {
  x1: number; y1: number;
  x2: number; y2: number;
  active: boolean;
  color: string;
  index: number;
}

function Connection({ x1, y1, x2, y2, active, color, index }: ConnectionProps) {
  // Curved path
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const curve = len * 0.15;
  const cx = mx - (dy / len) * curve;
  const cy = my + (dx / len) * curve;
  const path = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

  return (
    <g>
      {/* Base line */}
      <path
        d={path}
        fill="none"
        stroke={active ? color : '#1e2535'}
        strokeWidth={active ? 1.5 : 1}
        strokeDasharray={active ? 'none' : '4 4'}
        opacity={active ? 0.4 : 0.25}
      />

      {/* Animated data packet */}
      {active && (
        <>
          <motion.circle
            r={3}
            fill={color}
            opacity={0.9}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            animate={{
              offsetDistance: ['0%', '100%'],
            }}
            transition={{
              duration: 2.5,
              delay: index * 0.7,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <animateMotion
              dur="2.5s"
              begin={`${index * 0.7}s`}
              repeatCount="indefinite"
              path={path}
            />
          </motion.circle>
          <motion.circle
            r={2}
            fill={color}
            opacity={0.5}
          >
            <animateMotion
              dur="2.5s"
              begin={`${index * 0.7 + 1.2}s`}
              repeatCount="indefinite"
              path={path}
            />
          </motion.circle>
        </>
      )}
    </g>
  );
}

export default function TaskConnections({ containerWidth, containerHeight }: TaskConnectionsProps) {
  const agents = useAppStore((s) => s.agents);

  const agentMap = new Map(agents.map((a) => [a.id, a]));

  return (
    <g>
      {connectionPairs.map((pair, i) => {
        const from = agentMap.get(pair.from);
        const to   = agentMap.get(pair.to);
        if (!from || !to) return null;

        const x1 = (from.position.x / 100) * containerWidth;
        const y1 = (from.position.y / 100) * containerHeight;
        const x2 = (to.position.x / 100) * containerWidth;
        const y2 = (to.position.y / 100) * containerHeight;

        return (
          <Connection
            key={`${pair.from}-${pair.to}`}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            active={pair.active}
            color={from.color}
            index={i}
          />
        );
      })}
    </g>
  );
}
