import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { formatCurrency, cn } from '../../lib/utils';
import { Minus, Plus, Bell, Check, AlertCircle } from 'lucide-react';

interface QuickStockAdjusterProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSaveStock: (
    itemId: string,
    variantSize: string,
    newCount: number,
    reason: string,
    notifyCarver: boolean
  ) => Promise<void>;
}

export const QuickStockAdjuster: React.FC<QuickStockAdjusterProps> = ({
  isOpen,
  onClose,
  item,
  onSaveStock,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentCount, setCurrentCount] = useState<number>(1);
  const [reason, setReason] = useState<string>(
    'Fresh Batch received from Master Carver'
  );
  const [notifyCarver, setNotifyCarver] = useState<boolean>(true);

  // Sync state when item changes
  useEffect(() => {
    if (item && item.variants.length > 0) {
      const defaultVariant =
        item.variants.find((v) => v.status === 'Low Stock') || item.variants[0];
      setSelectedSize(defaultVariant.size);
      setCurrentCount(defaultVariant.stock);
    }
  }, [item]);

  if (!item) return null;

  const activeVariant = item.variants.find((v) => v.size === selectedSize);

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const v = item.variants.find((variant) => variant.size === size);
    if (v) {
      setCurrentCount(v.stock);
    }
  };

  const handleSave = async () => {
    try {
      await onSaveStock(item.id, selectedSize, currentCount, reason, notifyCarver);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save this stock adjustment.');
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Stock Adjuster"
      subtitle="Immediate count update for gallery & store"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose} className="font-serif">
            Cancel
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => void handleSave()}
            className="font-serif uppercase tracking-wider font-semibold"
          >
            <Check className="w-4 h-4 mr-1.5" />
            <span>Save Stock</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-xs text-[#3A2D20]">
        {/* Active Product Selection Card */}
        <div className="p-4 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/30 space-y-1 shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-[#8B5A2B] font-serif font-bold block">
            ACTIVE PRODUCT SELECTION
          </span>
          <h3 className="font-serif text-base font-bold text-[#3A2D20]">
            {item.name}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-[#5C5248] font-sans">
            <span>SKU: {item.sku}</span>
            <span>•</span>
            <span className="font-bold text-[#8B5A2B]">
              {formatCurrency(item.basePrice)}
            </span>
          </div>
        </div>

        {/* 1. Choose Size Variant */}
        <div className="space-y-2">
          <label className="font-serif font-bold text-[#3A2D20] block uppercase tracking-wider text-[11px]">
            1. Choose Size Variant to Update:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {item.variants.map((v) => {
              const isSelected = selectedSize === v.size;
              return (
                <button
                  key={v.size}
                  type="button"
                  onClick={() => handleSizeChange(v.size)}
                  className={cn(
                    'p-2.5 rounded-sm border text-center transition-all',
                    isSelected
                      ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-2xs'
                      : 'bg-[#FFFDF5] text-[#5C5248] border-[#D4AF37]/30 hover:border-[#8B5A2B]'
                  )}
                >
                  <span className="font-bold block font-serif">{v.size}</span>
                  <span
                    className={cn(
                      'text-[10px] block mt-0.5',
                      isSelected ? 'text-[#D4AF37]' : 'text-[#8C8276]'
                    )}
                  >
                    {v.stock} {v.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Adjust Physical Stock Count */}
        <div className="space-y-2">
          <label className="font-serif font-bold text-[#3A2D20] block uppercase tracking-wider text-[11px]">
            2. Adjust Physical Stock Count:
          </label>
          <p className="text-[11px] text-[#5C5248] font-sans">
            Tap plus or minus to balance atelier workshop inventory.
          </p>

          <div className="flex items-center justify-between p-4 bg-[#FFFDF5] border border-[#D4AF37]/30 rounded-md shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrentCount(Math.max(0, currentCount - 1))}
              className="w-10 h-10 rounded-sm border border-[#D4AF37]/30 text-[#5C5248] hover:text-[#3A2D20] hover:bg-[#F5F2ED] flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Decrease stock"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="font-serif text-3xl font-bold text-[#3A2D20] block">
                {currentCount}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#8C8276] font-serif block font-bold">
                Pieces Physically Present
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentCount(currentCount + 1)}
              className="w-10 h-10 rounded-sm bg-[#8B5A2B] hover:bg-[#724923] text-white flex items-center justify-center transition-colors shadow-2xs focus:outline-none"
              aria-label="Increase stock"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3. Reason for Ledger Balance */}
        <div className="space-y-2">
          <label className="font-serif font-bold text-[#3A2D20] block uppercase tracking-wider text-[11px]">
            3. Reason for Ledger Balance:
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2.5 rounded-sm bg-[#FFFDF5] border border-[#D4AF37]/30 text-xs font-serif text-[#3A2D20] focus:border-[#8B5A2B] focus:outline-none shadow-2xs"
          >
            <option value="Fresh Batch received from Master Carver">
              Fresh Batch received from Master Carver
            </option>
            <option value="Routine physical verification audit">
              Routine physical verification audit
            </option>
            <option value="Allocated to temple consecration installation">
              Allocated to temple consecration installation
            </option>
            <option value="Transit crate return or inspection">
              Transit crate return or inspection
            </option>
            <option value="Damaged in handling (moved to restoration)">
              Damaged in handling (moved to restoration)
            </option>
          </select>
        </div>

        {/* Re-order Threshold Alert Block (Terracotta alert styling) */}
        <div className="p-4 rounded-md bg-[#A34D3D]/10 border border-[#A34D3D]/30 space-y-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Bell className="w-4 h-4 text-[#A34D3D] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-xs text-[#A34D3D]">
                Re-order Threshold Alert
              </h4>
              <p className="text-[11px] text-[#5C5248] leading-relaxed font-sans">
                When stock drops below 2 pieces, automatic requisition is signaled to Master
                Sculptor Ramswaroop Ji in Jaipur.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 border-t border-[#A34D3D]/20 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyCarver}
              onChange={(e) => setNotifyCarver(e.target.checked)}
              className="accent-[#A34D3D] text-[#A34D3D] focus:ring-[#A34D3D] rounded-xs"
            />
            <span className="text-[11px] text-[#5C5248] font-medium font-sans">
              Notify Carver immediately via SMS / WhatsApp
            </span>
          </label>
        </div>
      </div>
    </Sheet>
  );
};
