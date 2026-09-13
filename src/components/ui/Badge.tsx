import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'cream' | 'terracotta' | 'dark' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'gold',
  size = 'md',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center font-medium tracking-wider uppercase select-none';

  const variants = {
    gold: 'bg-[#F5ECD9] text-[#6E441E] border border-[#DFCBB5]',
    cream: 'bg-[#FAF6EF] text-[#4A3E36] border border-[#E8DFC8]',
    terracotta: 'bg-[#FBF0ED] text-[#9C3B24] border border-[#E8C4BC]',
    dark: 'bg-[#29231E] text-[#F3ECE1] border border-[#3E3630]',
    outline: 'bg-transparent text-[#7A4F23] border border-[#D5C2A8]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 rounded-xs tracking-widest',
    md: 'text-[11px] px-2.5 py-1 rounded-xs tracking-wider',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
