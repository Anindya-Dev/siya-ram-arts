import React from 'react';
import {
  Package,
  Truck,
  AlertTriangle,
  Layers,
  Users,
  Receipt,
  MessageCircle,
  ExternalLink,
  Store,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminSidebarProps {
  activeSection: string;
  onSelectSection: (s: string) => void;
  lowStockCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSelectSection,
  lowStockCount,
}) => {
  const menuItems = [
    {
      id: 'catalog',
      label: 'Product Catalog',
      icon: Package,
      badge: '148',
      badgeStyle: 'bg-[#F5F2ED] text-[#8B5A2B] border border-[#D4AF37]/20',
    },
    {
      id: 'orders',
      label: 'Orders & Shipments',
      icon: Truck,
      badge: '4 New',
      badgeStyle: 'bg-[#8B5A2B]/10 text-[#8B5A2B]',
    },
    {
      id: 'alerts',
      label: 'Inventory Alerts',
      icon: AlertTriangle,
      badge: `${lowStockCount} Low`,
      badgeStyle: 'bg-[#A34D3D]/15 text-[#A34D3D] border border-[#A34D3D]/30',
    },
    {
      id: 'bulk',
      label: 'Bulk Quick-Stock',
      icon: Layers,
    },
    {
      id: 'artisans',
      label: 'Artisan Carvers',
      icon: Users,
      badge: '18 Ustads',
      badgeStyle: 'bg-[#F5F2ED] text-[#8B5A2B] border border-[#D4AF37]/20',
    },
    {
      id: 'gst',
      label: 'GST & Invoicing',
      icon: Receipt,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Studio / Workshop Control Card */}
      <div className="p-4 rounded-lg bg-[#FFFDF5] border border-[#D4AF37]/25 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#8B5A2B] text-white flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-[#3A2D20]">
              Jalandhar Studio
            </h2>
            <span className="text-[10px] text-[#8C8276] block uppercase tracking-wider font-semibold">
              Primary Sanctum Warehouse
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#D4AF37]/20 space-y-1.5 text-xs text-[#8B5A2B]">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-pulse" />
            <span>Jalandhar Atelier & Warehouse Online</span>
          </div>
          <p className="text-[11px] text-[#5C5248] leading-tight font-sans">
            House No. 89, Near Muslim Colony, Gandhi Nagar, Jalandhar, Punjab - 144001
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-2 rounded-lg bg-[#FFFDF5] border border-[#D4AF37]/25 shadow-2xs space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-serif transition-colors text-left',
                isActive
                  ? 'bg-[#F5F2ED] text-[#8B5A2B] font-bold border-l-2 border-[#8B5A2B]'
                  : 'text-[#5C5248] hover:bg-[#F5F2ED]/70 hover:text-[#3A2D20]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isActive ? 'text-[#8B5A2B]' : 'text-[#8C8276]'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-xs font-sans font-bold',
                    item.badgeStyle
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dedicated Concierge Callout */}
      <div className="p-4 rounded-lg bg-[#F5F2ED] border border-[#D4AF37]/25 text-xs space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 font-serif font-bold text-[#3A2D20]">
          <MessageCircle className="w-4 h-4 text-[#8B5A2B]" />
          <span>Need Carver Coordination?</span>
        </div>
        <p className="text-[#5C5248] leading-relaxed font-sans">
          Our Jalandhar workshop liaison is available 7:00 AM - 9:00 PM (+91 98762 86046).
        </p>
        <a
          href="https://wa.me/919876286046?text=Namaste%20Siya%20Ram%20Arts!%20%F0%9F%99%8F%0AI%20am%20contacting%20from%20the%20Studio%20Admin%20Desk."
          target="_blank"
          rel="noopener noreferrer"
          className="pt-1 text-[#25D366] hover:underline font-serif flex items-center gap-1 font-bold inline-block"
        >
          <span>WhatsApp Desk (+91 98762 86046)</span>
          <ExternalLink className="w-3 h-3 inline" />
        </a>
      </div>
    </aside>
  );
};
