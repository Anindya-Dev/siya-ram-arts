import React from 'react';
import { Button } from '../ui/Button';
import { Download, CalendarCheck } from 'lucide-react';

export const BespokeConsultationSection: React.FC = () => {
  return (
    <section id="bespoke" className="py-16 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-xl bg-[#FFFDF5] border border-[#D4AF37]/30 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#8B5A2B] font-serif font-bold block">
              CUSTOM TEMPLE MANDIR INSTALLATIONS
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3A2D20]">
              Need Bespoke Murti for Your Home Sanctum or Community Temple?
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5248] leading-relaxed font-sans">
              Consult our Jalandhar Sthapathis for custom dimensions (from 1ft to 6ft), Vastu
              architectural alignment, and customized pedestal finishes.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <Button
              variant="gold"
              size="md"
              className="font-serif uppercase tracking-wider text-xs px-6 py-3"
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              <span>Book Sthapathi Consultation</span>
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="font-serif uppercase tracking-wider text-xs px-6 py-3"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>Download Catalog (PDF)</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
