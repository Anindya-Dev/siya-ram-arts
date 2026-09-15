import React from 'react';
import { Download, Plus, Search, Filter } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDeity: string;
  onDeityChange: (d: string) => void;
  selectedMaterial: string;
  onMaterialChange: (m: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  onExportCsv: () => void;
  onAddProduct: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedDeity,
  onDeityChange,
  selectedMaterial,
  onMaterialChange,
  selectedStatus,
  onStatusChange,
  onExportCsv,
  onAddProduct,
}) => {
  return (
    <div className="space-y-6">
      {/* Title & Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4AF37]/20 gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#8B5A2B] uppercase font-serif font-bold block mb-1">
            INVENTORY & STOCK MANAGEMENT • LIVE REGISTRY
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3A2D20]">
            Product Catalog
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCsv}
            className="font-serif uppercase tracking-wider text-xs px-4"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={onAddProduct}
            className="font-serif uppercase tracking-wider text-xs px-4"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-lg bg-[#FFFDF5] border border-[#D4AF37]/25 shadow-2xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8276] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by deity, material, SKU, or atelier..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F5F2ED] border border-[#D4AF37]/30 rounded-sm focus:bg-white focus:border-[#8B5A2B] focus:outline-none transition-all placeholder:text-[#8C8276] text-[#3A2D20]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Deities Dropdown */}
          <select
            value={selectedDeity}
            onChange={(e) => onDeityChange(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F5F2ED] border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none font-serif text-[#3A2D20]"
          >
            <option value="All">All Sacred Deities</option>
            <option value="Lord Ram">Lord Ram</option>
            <option value="Mahadev Shiva">Lord Shiva</option>
            <option value="Radha Krishna">Radha Krishna</option>
            <option value="Shri Ganesha">Shri Ganesha</option>
            <option value="Maa Durga">Maa Durga</option>
            <option value="Lord Hanuman">Lord Hanuman</option>
          </select>

          {/* Materials Dropdown */}
          <select
            value={selectedMaterial}
            onChange={(e) => onMaterialChange(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F5F2ED] border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none font-serif text-[#3A2D20]"
          >
            <option value="All">All Mediums</option>
            <option value="Resin">Chemical Resin</option>
            <option value="Casting">Chemical Casting</option>
          </select>

          {/* Stock Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F5F2ED] border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none font-serif text-[#3A2D20]"
          >
            <option value="All">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Mandir Reserved">Mandir Reserved</option>
          </select>
        </div>
      </div>
    </div>
  );
};
