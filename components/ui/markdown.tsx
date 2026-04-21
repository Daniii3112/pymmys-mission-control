'use client';

/**
 * Minimal inline Markdown renderer — no external dependencies.
 * Handles the subset produced by scribe.py:
 *   headings (# ## ###), bold (**), italic (*), inline code (`),
 *   horizontal rules, blockquotes, unordered lists, ordered lists,
 *   GitHub-flavoured tables, and paragraphs.
 */

import React from 'react';

// ─── Inline formatter (bold / italic / code) ──────────────────────────────────

function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return (
            <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {part.slice(2, -2)}
            </strong>
          );
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i}>{part.slice(1, -1)}</em>;
        if (part.startsWith('`') && part.endsWith('`'))
          return (
            <code
              key={i}
              className="px-1 py-0.5 rounded text-[10px]"
              style={{
                background: 'var(--bg-overlay)',
                color: 'var(--accent-amber)',
                fontFamily: 'var(--font-geist-mono)',
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        return part;
      })}
    </>
  );
}

// ─── Table ─────────────────────────────────────────────────────────────────────

function MarkdownTable({ lines }: { lines: string[] }) {
  const isSeparator = (l: string) => /^[\s|:-]+$/.test(l);
  const parse = (l: string) =>
    l
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());

  const rows = lines.filter((l) => !isSeparator(l)).map(parse);
  if (rows.length === 0) return null;
  const [header, ...body] = rows;

  return (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-[10px]" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {header.map((cell, i) => (
              <th
                key={i}
                className="text-left py-1 pr-4 font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {inline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="py-1 pr-4 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {inline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Block parser ─────────────────────────────────────────────────────────────

interface MarkdownProps {
  children: string;
  className?: string;
}

export default function Markdown({ children, className = '' }: MarkdownProps) {
  const lines = children.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    // h1
    if (line.startsWith('# ')) {
      nodes.push(
        <h1 key={i} className="text-sm font-bold mt-3 mb-1.5 first:mt-0" style={{ color: 'var(--text-primary)' }}>
          {inline(line.slice(2))}
        </h1>,
      );
      i++; continue;
    }

    // h2
    if (line.startsWith('## ')) {
      nodes.push(
        <h2
          key={i}
          className="text-[11px] font-bold mt-3 mb-1 first:mt-0 uppercase tracking-wider"
          style={{ color: 'var(--text-primary)' }}
        >
          {inline(line.slice(3))}
        </h2>,
      );
      i++; continue;
    }

    // h3
    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={i} className="text-[11px] font-semibold mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>
          {inline(line.slice(4))}
        </h3>,
      );
      i++; continue;
    }

    // horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      nodes.push(
        <hr key={i} className="my-2 border-0 h-px" style={{ background: 'var(--border-subtle)' }} />,
      );
      i++; continue;
    }

    // blockquote
    if (line.startsWith('> ')) {
      nodes.push(
        <blockquote
          key={i}
          className="border-l-2 pl-3 my-1.5 italic text-[11px]"
          style={{ borderColor: 'var(--accent-indigo)', color: 'var(--text-secondary)' }}
        >
          {inline(line.slice(2))}
        </blockquote>,
      );
      i++; continue;
    }

    // table
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) { tableLines.push(lines[i]); i++; }
      nodes.push(<MarkdownTable key={`tbl-${i}`} lines={tableLines} />);
      continue;
    }

    // unordered list
    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
      nodes.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-0.5 my-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          {items.map((item, j) => <li key={j}>{inline(item)}</li>)}
        </ul>,
      );
      continue;
    }

    // ordered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++; }
      nodes.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-0.5 my-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          {items.map((item, j) => <li key={j}>{inline(item)}</li>)}
        </ol>,
      );
      continue;
    }

    // paragraph
    nodes.push(
      <p key={i} className="text-[11px] leading-relaxed my-1" style={{ color: 'var(--text-secondary)' }}>
        {inline(line)}
      </p>,
    );
    i++;
  }

  return <div className={className}>{nodes}</div>;
}
