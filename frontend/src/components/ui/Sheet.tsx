import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-md md:max-w-[480px]',
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop overlay - proper floating overlay that prevents table column clipping */}
      <div
        className="fixed inset-0 bg-[#1C1815]/50 backdrop-blur-[3px] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6">
        <div
          className={cn(
            'w-screen bg-[#FAF9F6] text-[#2D2D2D] border-l border-[#D4AF37]/30 shadow-2xl flex flex-col transform transition ease-in-out duration-300',
            maxWidth
          )}
        >
          {/* Header */}
          <div className="p-6 border-b border-[#D4AF37]/20 bg-[#FFFDF5] flex items-start justify-between">
            <div>
              <h2 id="sheet-title" className="font-serif text-xl font-medium text-[#3A2D20]">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-xs text-[#5C5248] tracking-wide">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="p-1.5 -mr-1 rounded-sm text-[#5C5248] hover:text-[#2D2D2D] hover:bg-[#F5F2ED] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content with smooth internal scrolling */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>

          {/* Footer actions */}
          {footer && (
            <div className="p-5 border-t border-[#D4AF37]/20 bg-[#FFFDF5]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
