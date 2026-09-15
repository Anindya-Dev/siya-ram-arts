import React from 'react';
import { AlertCircle, ArrowRight, Bell } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminAlertBannerProps {
  onReviewPreOrders: () => void;
  onSubmitRequisition: () => void;
}

export const AdminAlertBanner: React.FC<AdminAlertBannerProps> = ({
  onReviewPreOrders,
  onSubmitRequisition,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-lg bg-[#A34D3D]/10 border border-[#A34D3D]/30 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3 text-xs text-[#5C5248]">
        <div className="w-8 h-8 rounded-full bg-[#A34D3D]/20 flex items-center justify-center text-[#A34D3D] shrink-0 mt-0.5">
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-sm text-[#A34D3D]">
            Low Stock Requisition Alert
          </h4>
          <p className="mt-0.5 text-xs text-[#5C5248] leading-relaxed font-sans">
            Ayodhya Ram Lalla (18" Chemical Resin) has only <strong>1 piece left</strong> in the
            Jalandhar Studio. Devotee demand is peak for upcoming Akshaya Tritiya consecrations.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
        <button
          onClick={onReviewPreOrders}
          className="px-3.5 py-1.5 rounded-sm text-xs font-serif text-[#A34D3D] hover:bg-[#A34D3D]/10 transition-colors border border-[#A34D3D]/30 font-semibold"
        >
          Review Pre-Orders
        </button>
        <button
          onClick={onSubmitRequisition}
          className="px-3.5 py-1.5 rounded-sm text-xs font-serif font-bold bg-[#A34D3D] hover:bg-[#8B3E30] text-white transition-colors shadow-2xs"
        >
          Submit Requisition
        </button>
      </div>
    </div>
  );
};
