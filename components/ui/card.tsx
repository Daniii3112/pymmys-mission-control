'use client';

import { type CSSProperties, type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className = '', style, onClick, hover, gradient }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl overflow-hidden ${hover ? 'transition-all duration-200 cursor-pointer' : ''} ${gradient ? 'gradient-border' : ''} ${className}`}
      style={{
        background: 'var(--bg-raised)',
        border: gradient ? undefined : '1px solid var(--border-subtle)',
        ...(hover ? {} : {}),
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'var(--border-default)';
        el.style.transform = 'translateY(-1px)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'var(--border-subtle)';
        el.style.transform = 'translateY(0)';
      } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 ${className}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
