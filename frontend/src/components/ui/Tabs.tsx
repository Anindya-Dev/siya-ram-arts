import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  className?: string;
  tabListClassName?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTabId,
  className,
  tabListClassName,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || items[0]?.id);

  const activeItem = items.find((item) => item.id === activeTab) || items[0];

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Navigation List */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          'flex border-b border-[#D4AF37]/20 overflow-x-auto scrollbar-none gap-2 sm:gap-6',
          tabListClassName
        )}
      >
        {items.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'group relative py-4 px-2 sm:px-3 text-sm sm:text-base font-serif tracking-wide transition-colors whitespace-nowrap flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]',
                isActive
                  ? 'text-[#8B5A2B] font-bold border-b-2 border-[#A67C52]'
                  : 'text-[#5C5248] opacity-70 hover:opacity-100 hover:text-[#2D2D2D]'
              )}
            >
              {tab.icon && (
                <span
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-[#8B5A2B]' : 'text-[#8C8276]'
                  )}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    isActive
                      ? 'bg-[#F5F2ED] text-[#8B5A2B] border border-[#D4AF37]/30'
                      : 'bg-[#E6E2DA] text-[#6C6258]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel Content */}
      <div
        role="tabpanel"
        id={`panel-${activeItem.id}`}
        aria-labelledby={`tab-${activeItem.id}`}
        className="pt-8 focus:outline-none"
      >
        {activeItem.content}
      </div>
    </div>
  );
};
