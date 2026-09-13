import React from 'react';
import { InventoryItem } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { StockBadge } from '../ui/StockBadge';
import { SlidersHorizontal, ChevronRight, AlertCircle } from 'lucide-react';

interface AdminInventoryTableProps {
  items: InventoryItem[];
  onOpenAdjuster: (item: InventoryItem) => void;
}

export const AdminInventoryTable: React.FC<AdminInventoryTableProps> = ({
  items,
  onOpenAdjuster,
}) => {
  return (
    <div className="bg-[#FFFDF5] border border-[#D4AF37]/25 rounded-lg shadow-2xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 bg-[#F5F2ED] border-b border-[#D4AF37]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#3A2D20]">
          <span>Product Inventory</span>
          <span className="text-xs font-normal text-[#8C8276]">
            (Showing {items.length} items)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-serif text-[#5C5248]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8B5A2B]" />
            <span>Healthy (3+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Terracotta dot */}
            <span className="w-2 h-2 rounded-full bg-[#A34D3D]" />
            <span>Low Stock (&lt;2)</span>
          </div>
        </div>
      </div>

      {/* Responsive Horizontal Scroll Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#3A2D20] min-w-[980px]">
          <thead className="bg-[#F5F2ED]/70 text-[#8C8276] font-serif uppercase tracking-wider text-[10px] border-b border-[#D4AF37]/20">
            <tr>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Masterpiece & SKU
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Deity Form
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Material & Purity
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Size & Net Weight
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Variant Stock Count
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Price
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Stock Status
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#D4AF37]/15">
            {items.map((item) => {
              return (
                <tr
                  key={item.id}
                  className="hover:bg-[#F5F2ED]/50 transition-colors group"
                >
                  {/* Masterpiece & SKU */}
                  <td className="py-4 px-4 font-serif">
                    <div className="font-bold text-sm text-[#3A2D20] group-hover:text-[#8B5A2B] transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[#8C8276] font-sans mt-0.5">
                      SKU: {item.sku} • {item.atelier}
                    </div>
                  </td>

                  {/* Deity Form */}
                  <td className="py-4 px-4 font-serif">
                    <span className="font-bold text-[#3A2D20] block">
                      {item.deityForm.split('•')[0]}
                    </span>
                    <span className="text-[11px] text-[#8C8276] block font-sans">
                      {item.deityForm.split('•')[1] || ''}
                    </span>
                  </td>

                  {/* Material & Purity */}
                  <td className="py-4 px-4">
                    <div className="text-xs text-[#5C5248] font-medium line-clamp-2 max-w-[160px] font-sans">
                      {item.materialPurity}
                    </div>
                  </td>

                  {/* Size & Net Weight */}
                  <td className="py-4 px-4 text-xs text-[#5C5248] font-sans">
                    {item.sizeAndWeight}
                  </td>

                  {/* Variant Stock Count Pills */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      {item.variants.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[11px] text-[#5C5248] gap-2 font-sans"
                        >
                          <span className="w-16 shrink-0">{v.size}:</span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-xs text-[10px] font-bold text-center min-w-[52px]',
                              v.stock === 0
                                ? 'bg-[#F5F2ED] text-[#8C8276]'
                                : v.stock <= v.threshold
                                ? 'bg-[#A34D3D]/15 text-[#A34D3D] border border-[#A34D3D]/30'
                                : 'bg-[#8B5A2B]/10 text-[#8B5A2B]'
                            )}
                          >
                            {v.stock} {v.unit}
                            {v.stock <= v.threshold && v.stock > 0 && ' (Low)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 font-serif font-bold text-sm text-[#8B5A2B]">
                    <div>{formatCurrency(item.basePrice)}</div>
                    <span className="text-[10px] text-[#8C8276] font-normal block font-sans">
                      GST incl.
                    </span>
                  </td>

                  {/* Stock Status */}
                  <td className="py-4 px-4">
                    <StockBadge status={item.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => onOpenAdjuster(item)}
                      className="px-3 py-1.5 rounded-sm bg-[#F5F2ED] hover:bg-[#8B5A2B] text-[#8B5A2B] hover:text-white border border-[#D4AF37]/30 font-serif text-xs font-bold transition-all inline-flex items-center gap-1 shadow-2xs"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Quick Adjust</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-[#F5F2ED] border-t border-[#D4AF37]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5C5248] font-serif">
        <div>
          Displaying {items.length} active master listings • Last synchronized with Jaipur
          workshop 14 mins ago
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button className="px-2.5 py-1 rounded-sm border border-[#D4AF37]/30 bg-[#FFFDF5] text-[#5C5248] hover:bg-[#F5F2ED] font-semibold">
            Previous Page
          </button>
          <button className="px-2.5 py-1 rounded-sm bg-[#8B5A2B] text-white font-bold">
            1
          </button>
          <button className="px-2.5 py-1 rounded-sm border border-[#D4AF37]/30 bg-[#FFFDF5] text-[#5C5248] hover:bg-[#F5F2ED]">
            2
          </button>
          <button className="px-2.5 py-1 rounded-sm border border-[#D4AF37]/30 bg-[#FFFDF5] text-[#5C5248] hover:bg-[#F5F2ED]">
            3
          </button>
        </div>
      </div>
    </div>
  );
};
