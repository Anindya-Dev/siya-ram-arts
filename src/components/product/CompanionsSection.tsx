import React from 'react';
import { ArrowRight } from 'lucide-react';
import { COMPANIONS } from '../../data/products';
import { formatCurrency } from '../../lib/utils';

interface CompanionsSectionProps {
  onSelectProduct: (slug: string) => void;
}

export const CompanionsSection: React.FC<CompanionsSectionProps> = ({
  onSelectProduct,
}) => {
  return (
    <section className="py-16 border-t border-[#D4AF37]/20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 gap-4 border-b border-[#D4AF37]/20">
        <div>
          <span className="text-[11px] tracking-[0.25em] text-[#8B5A2B] uppercase font-serif font-bold block mb-1">
            MANDIR PARIVAAR ENSEMBLE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A2D20]">
            Companions for Your Sanctum
          </h2>
        </div>
        <button
          onClick={() => onSelectProduct('handcrafted-chemical-resin-ram-lalla')}
          className="text-xs font-serif uppercase tracking-wider text-[#8B5A2B] hover:text-[#724923] font-bold flex items-center gap-1.5"
        >
          <span>Explore Complete Ram Darbar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {COMPANIONS.map((companion) => (
          <div
            key={companion.id}
            onClick={() => onSelectProduct(companion.slug)}
            className="group bg-[#FFFDF5] border border-[#D4AF37]/25 rounded-md overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
          >
            {/* Image */}
            <div className="relative h-72 w-full bg-[#F5F2ED] overflow-hidden">
              <img
                src={companion.image}
                alt={companion.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-[#FFFDF5]/90 backdrop-blur-xs px-2.5 py-1 rounded-xs border border-[#D4AF37]/30 text-[10px] font-serif uppercase tracking-widest text-[#8B5A2B] font-bold shadow-2xs">
                {companion.tag}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-serif uppercase tracking-wider text-[#8C8276] block">
                  {companion.material}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#3A2D20] group-hover:text-[#8B5A2B] transition-colors mt-0.5">
                  {companion.name}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between font-serif">
                <span className="text-base font-bold text-[#8B5A2B]">
                  {formatCurrency(companion.price)}
                </span>
                <span className="text-xs text-[#8B5A2B] group-hover:translate-x-1 transition-transform font-bold flex items-center gap-1 uppercase tracking-wider">
                  View Murti <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
