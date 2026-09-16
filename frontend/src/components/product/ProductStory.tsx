import React from 'react';
import { Product } from '../../types';

interface ProductStoryProps {
  product: Product;
}

export const ProductStory: React.FC<ProductStoryProps> = ({ product }) => {
  return (
    <section className="py-16 border-t border-[#D4AF37]/20 bg-[#FAF9F6]">
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[11px] tracking-[0.25em] text-[#8B5A2B] uppercase font-serif font-bold block mb-2">
                48 DAYS OF LIVING DEVOTION
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A2D20] leading-[1.25]">
                Master Cast in High-Density Chemical Resin, Finished in Deep Dhyana
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#5C5248] leading-relaxed font-sans">
              <p>
                The high-grade chemical resin formulated for this iconic vigraha is cast with
                meticulous precision to achieve a flawless, non-porous finish. Impervious to water,
                milk, and seasonal climate shifts, it ensures enduring strength and crisp sacred
                detail across decades of home ritual.
              </p>
              <p>
                Every delicate contour is hand-detailed and painted following the timeless canons
                of the <em>Manasara Shilpa Shastra</em>. Master artisans spend dedicated days
                perfecting the <em>Netronmeelana</em> (opening of the sacred eyes), infusing the
                form with the compassionate, youthful gaze of the divine swaroop.
              </p>
            </div>

            {/* Master Sculptor Quote */}
            {product.carverQuote && (
              <div className="p-6 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/25 space-y-3 shadow-2xs">
                <blockquote className="italic font-serif text-sm sm:text-base text-[#3A2D20] leading-relaxed">
                  "{product.carverQuote.quote}"
                </blockquote>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-[#8B5A2B] text-white font-serif text-xs font-bold flex items-center justify-center shadow-2xs">
                    RS
                  </div>
                  <div>
                    <span className="font-serif font-bold text-xs text-[#3A2D20] block">
                      {product.carverQuote.artisanName}
                    </span>
                    <span className="text-[11px] text-[#8C8276]">
                      {product.carverQuote.artisanTitle}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Photo Documentation Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-[#D4AF37]/30 shadow-md bg-[#1C1814]">
              <img
                src={product.images[0]?.url || "/static/idols/swarna-vastra-krishna.png"}
                alt={product.name}
                className="w-full h-[380px] object-contain p-4 bg-[#110D0A]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-[#FAF9F6] text-xs font-serif">
                <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider block font-bold">
                  JALANDHAR ATELIER LIVE DOCUMENTATION
                </span>
                <span>Hand-finishing the sacred Padmasana base and Prabhavali archway.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Specifications Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-md bg-[#FFFDF5] border border-[#D4AF37]/25 text-center space-y-1 shadow-2xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8276] font-serif block">
              Net Weight
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#3A2D20] block">
              {product.specifications.netWeight}
            </span>
            <span className="text-[10px] text-[#5C5248]">High-Density Resin</span>
          </div>

          <div className="p-4 rounded-md bg-[#FFFDF5] border border-[#D4AF37]/25 text-center space-y-1 shadow-2xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8276] font-serif block">
              Height / Width
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#3A2D20] block">
              {product.specifications.heightWidth}
            </span>
            <span className="text-[10px] text-[#5C5248]">Pedestal to Chhatra</span>
          </div>

          <div className="p-4 rounded-md bg-[#FFFDF5] border border-[#D4AF37]/25 text-center space-y-1 shadow-2xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8276] font-serif block">
              Provenance
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#3A2D20] block">
              Jalandhar
            </span>
            <span className="text-[10px] text-[#5C5248]">Punjab, Bharat</span>
          </div>

          <div className="p-4 rounded-md bg-[#FFFDF5] border border-[#D4AF37]/25 text-center space-y-1 shadow-2xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8276] font-serif block">
              Pratishtha
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#8B5A2B] block">
              Included
            </span>
            <span className="text-[10px] text-[#5C5248]">Vedic Mantra Vidhi</span>
          </div>
        </div>
      </div>
    </section>
  );
};
