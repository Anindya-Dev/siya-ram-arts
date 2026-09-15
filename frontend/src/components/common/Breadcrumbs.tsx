import React from 'react';
import { ChevronRight } from 'lucide-react';
import { BreadcrumbItem } from '../../types';
import { generateBreadcrumbSchema } from '../../lib/seo';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  const jsonLd = generateBreadcrumbSchema(items);

  return (
    <nav aria-label="Breadcrumb" className="w-full py-4 text-xs font-serif tracking-wider uppercase">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ol className="flex items-center flex-wrap gap-2 text-[#8C8276]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href + index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-[#D4AF37]/40" aria-hidden="true">
                  /
                </span>
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-bold text-[#3A2D20] truncate max-w-[280px] sm:max-w-md"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate(item.href)}
                  className="hover:text-[#8B5A2B] transition-colors focus:outline-none focus:underline"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
