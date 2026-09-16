import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'secondary' | 'dark' | 'terracotta' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'gold',
      size = 'md',
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      gold: 'bg-[#8B5A2B] text-white hover:bg-[#724923] active:bg-[#5C3A19] border border-[#8B5A2B] shadow-sm',
      secondary:
        'bg-[#FFFDF5] text-[#2D2D2D] hover:bg-[#F5F2ED] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 shadow-2xs',
      dark: 'bg-[#2D2D2D] text-[#FAF9F6] hover:bg-[#1F1F1F] active:bg-[#121212] border border-[#3A2D20]',
      terracotta:
        'bg-[#A34D3D] text-white hover:bg-[#8A3D2F] active:bg-[#732E22] border border-[#A34D3D] shadow-sm',
      ghost: 'text-[#5C5248] hover:text-[#2D2D2D] hover:bg-[#F5F2ED]/70',
      outline:
        'bg-transparent text-[#8B5A2B] border border-[#A67C52] hover:bg-[#FFFDF5]',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 rounded-sm gap-1.5',
      md: 'text-sm px-5 py-2.5 rounded-sm gap-2',
      lg: 'text-base px-7 py-3.5 rounded-sm gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
