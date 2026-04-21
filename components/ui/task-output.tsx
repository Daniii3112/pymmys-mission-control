'use client';

/**
 * TaskOutput — collapsible output block for completed tasks.
 * Used in the mission inspector and the agent inspector.
 */

import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Markdown from './markdown';

interface TaskOutputProps {
  output: string;
  accentColor?: string;
}

export default function TaskOutput({ output, accentColor = '#10b981' }: TaskOutputProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="mt-2 rounded-lg overflow-hidden"
      style={{ border: `1px solid ${accentColor}22`, background: `${accentColor}08` }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 transition-colors"
        style={{ color: accentColor }}
        onMouseEnter={(e) => (e.currentTarget.style.background = `${accentColor}10`)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <FileText size={11} />
        <span className="text-[10px] font-bold uppercase tracking-wider flex-1 text-left">
          Output
        </span>
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          className="px-3 pb-3 overflow-y-auto"
          style={{
            maxHeight: 220,
            borderTop: `1px solid ${accentColor}15`,
          }}
        >
          <Markdown className="pt-2">{output}</Markdown>
        </div>
      )}
    </div>
  );
}
