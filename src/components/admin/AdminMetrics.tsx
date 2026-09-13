import React from 'react';
import { Package, AlertCircle, Truck, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminMetricsProps {
  lowStockCount: number;
  onContactWorkshop: () => void;
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({
  lowStockCount,
  onContactWorkshop,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Catalog */}
      <div className="p-5 rounded-lg bg-[#FFFDF5] border border-[#D4AF37]/25 shadow-2xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[#8C8276] font-serif font-bold">
            Active Catalog
          </span>
          <div className="p-1.5 rounded-sm bg-[#F5F2ED] text-[#8B5A2B] border border-[#D4AF37]/20">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="font-serif text-3xl font-bold text-[#3A2D20] block">
            148
          </span>
          <span className="text-xs text-[#5C5248] mt-0.5 block">
            Consecrated Masterpieces
          </span>
        </div>
        <div className="pt-2 border-t border-[#D4AF37]/20 text-[11px] text-[#8C8276] flex items-center justify-between">
          <span>92 In-Studio</span>
          <span>•</span>
          <span>56 In Casting</span>
        </div>
      </div>

      {/* 2. Stock Watch (Terracotta alert styling) */}
      <div className="p-5 rounded-lg bg-[#A34D3D]/10 border border-[#A34D3D]/30 shadow-2xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[#A34D3D] font-serif font-bold">
            Stock Watch
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#A34D3D] text-white font-bold uppercase tracking-wider">
            {lowStockCount} Urgent
          </span>
        </div>
        <div>
          <span className="font-serif text-3xl font-bold text-[#A34D3D] block">
            {lowStockCount} Items
          </span>
          <span className="text-xs text-[#5C5248] mt-0.5 block font-medium">
            Below 2 pcs threshold
          </span>
        </div>
        <div className="pt-2 border-t border-[#A34D3D]/20">
          <button
            onClick={onContactWorkshop}
            className="w-full py-1.5 px-3 rounded-sm bg-[#A34D3D] hover:bg-[#8B3E30] text-[#FAF9F6] text-xs font-serif uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Contact Jalandhar Workshop</span>
          </button>
        </div>
      </div>

      {/* 3. Safe Crates in Transit */}
      <div className="p-5 rounded-lg bg-[#FFFDF5] border border-[#D4AF37]/25 shadow-2xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[#8C8276] font-serif font-bold">
            Safe Crates in Transit
          </span>
          <div className="p-1.5 rounded-sm bg-[#F5F2ED] text-[#8B5A2B] border border-[#D4AF37]/20">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="font-serif text-3xl font-bold text-[#3A2D20] block">
            12 Crates
          </span>
          <span className="text-xs text-[#5C5248] mt-0.5 block">
            Zero-vibration packaging
          </span>
        </div>
        <div className="pt-2 border-t border-[#D4AF37]/20 text-[11px] text-[#8C8276] flex items-center justify-between">
          <span>8 Domestic Mandirs</span>
          <span>•</span>
          <span>4 Overseas</span>
        </div>
      </div>

      {/* 4. Monthly Revenue */}
      <div className="p-5 rounded-lg bg-[#FFFDF5] border border-[#D4AF37]/25 shadow-2xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[#8C8276] font-serif font-bold">
            Monthly Revenue
          </span>
          <div className="p-1.5 rounded-sm bg-[#F5F2ED] text-[#8B5A2B] border border-[#D4AF37]/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="font-serif text-3xl font-bold text-[#8B5A2B] block">
            ₹8,42,000
          </span>
          <span className="text-xs text-[#5C5248] mt-0.5 block">
            April 2025 Orders
          </span>
        </div>
        <div className="pt-2 border-t border-[#D4AF37]/20 text-[11px] text-[#8B5A2B] font-bold flex items-center gap-1">
          <span>+18.4%</span>
          <span className="text-[#8C8276] font-normal">from March</span>
        </div>
      </div>
    </div>
  );
};
