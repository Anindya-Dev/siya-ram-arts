import React from 'react';
import { cn } from '../../lib/utils';

export interface StockBadgeProps {
  status: 'In Stock' | 'Low Stock' | 'Mandir Reserved' | 'Out of Stock' | 'Healthy';
  count?: number;
  label?: string;
  className?: string;
  showDot?: boolean;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  status,
  count,
  label,
  className,
  showDot = true,
}) => {
  let displayLabel = label || status;
  if (count !== undefined && !label) {
    displayLabel = `${count} ${count === 1 ? 'piece' : 'pieces'} remaining`;
  }

  // Warm terracotta styling for alert states (Fix 4)
  const styles = {
    'In Stock': {
      container: 'bg-[#F2F7EF] text-[#2D5A27] border border-[#D5E6CF]',
      dot: 'bg-[#3E7B35]',
    },
    'Healthy': {
      container: 'bg-[#F2F7EF] text-[#2D5A27] border border-[#D5E6CF]',
      dot: 'bg-[#3E7B35]',
    },
    'Low Stock': {
      // Natural Tones muted rust/terracotta (#A34D3D)
      container: 'bg-[#FAF0ED] text-[#A34D3D] border border-[#E8CAC3]',
      dot: 'bg-[#A34D3D]',
    },
    'Mandir Reserved': {
      container: 'bg-[#FFF9EC] text-[#8C6018] border border-[#F3DFC1]',
      dot: 'bg-[#B07B24]',
    },
    'Out of Stock': {
      container: 'bg-[#F4F1ED] text-[#7A736C] border border-[#E2DDD6]',
      dot: 'bg-[#8F8880]',
    },
  };

  const current = styles[status] || styles['In Stock'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium tracking-normal select-none',
        current.container,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', current.dot)} aria-hidden="true" />}
      <span>{displayLabel}</span>
    </span>
  );
};
