import React from 'react';
import {
  FileText,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Droplets,
  Award,
  Clock,
  Box,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '../../types';
import { ALL_REVIEWS } from '../../data/products';
import { Tabs, TabItem } from '../ui/Tabs';
import { Button } from '../ui/Button';

interface ProductTabsProps {
  product: Product;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  // Tab 1: Sacred Specifications
  const specificationsContent = (
    <div className="bg-[#FFFDF5] border border-[#D4AF37]/25 rounded-lg p-6 sm:p-8 shadow-2xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
        <div className="pb-4 border-b border-[#D4AF37]/20">
          <span className="text-xs uppercase tracking-wider text-[#8C8276] font-serif block">
            Canonical Form
          </span>
          <span className="font-serif text-base font-semibold text-[#3A2D20] mt-1 block">
            {product.specifications.canonicalForm}
          </span>
        </div>

        <div className="pb-4 border-b border-[#D4AF37]/20">
          <span className="text-xs uppercase tracking-wider text-[#8C8276] font-serif block">
            Primary Medium
          </span>
          <span className="font-serif text-base font-semibold text-[#3A2D20] mt-1 block">
            {product.specifications.primaryMedium}
          </span>
        </div>

        <div className="pb-4 border-b border-[#D4AF37]/20">
          <span className="text-xs uppercase tracking-wider text-[#8C8276] font-serif block">
            Ornamentation Grade
          </span>
          <span className="font-serif text-base font-semibold text-[#3A2D20] mt-1 block">
            {product.specifications.ornamentationGrade}
          </span>
        </div>

        <div className="pb-4 border-b border-[#D4AF37]/20">
          <span className="text-xs uppercase tracking-wider text-[#8C8276] font-serif block">
            Mudras & Attributes
          </span>
          <span className="font-serif text-base font-semibold text-[#3A2D20] mt-1 block">
            {product.specifications.mudrasAttributes}
          </span>
        </div>

        <div className="pb-4 border-b border-[#D4AF37]/20">
          <span className="text-xs uppercase tracking-wider text-[#8C8276] font-serif block">
            Pedestal Foundation
          </span>
          <span className="font-serif text-base font-semibold text-[#3A2D20] mt-1 block">
            {product.specifications.pedestalFoundation}
          </span>
        </div>

        <div className="pb-4 border-b border-[#D4AF37]/20">
          <span className="text-xs uppercase tracking-wider text-[#8C8276] font-serif block">
            Arch Composition
          </span>
          <span className="font-serif text-base font-semibold text-[#3A2D20] mt-1 block">
            {product.specifications.archComposition}
          </span>
        </div>

        <div className="pb-4 border-b border-[#D4AF37]/20 md:col-span-2">
          <span className="text-xs uppercase tracking-wider text-[#8C8276] font-serif block">
            Authentication Seal
          </span>
          <span className="font-serif text-base font-semibold text-[#8B5A2B] mt-1 block flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8B5A2B]" />
            <span>{product.specifications.authenticationSeal}</span>
          </span>
        </div>
      </div>
    </div>
  );

  // Tab 2: Consecration & Daily Seva Guidelines
  const sevaContent = (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panchamrit Abhishek */}
        <div className="bg-[#FFFDF5] p-6 rounded-lg border border-[#D4AF37]/25 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 text-[#8B5A2B]">
            <Droplets className="w-5 h-5 text-[#8B5A2B]" />
            <h4 className="font-serif text-lg font-bold text-[#3A2D20]">
              Panchamrit Abhishek
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5248] leading-relaxed font-sans">
            {product.sevaGuidelines.panchamritAbhishek}
          </p>
        </div>

        {/* Gold Foil Care */}
        <div className="bg-[#FFFDF5] p-6 rounded-lg border border-[#D4AF37]/25 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 text-[#8B5A2B]">
            <Award className="w-5 h-5 text-[#8B5A2B]" />
            <h4 className="font-serif text-lg font-bold text-[#3A2D20]">Gold Foil Care</h4>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5248] leading-relaxed font-sans">
            {product.sevaGuidelines.goldFoilCare}
          </p>
        </div>

        {/* Chandan & Kumkum */}
        <div className="bg-[#FFFDF5] p-6 rounded-lg border border-[#D4AF37]/25 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 text-[#8B5A2B]">
            <Sparkles className="w-5 h-5 text-[#8B5A2B]" />
            <h4 className="font-serif text-lg font-bold text-[#3A2D20]">Chandan & Kumkum</h4>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5248] leading-relaxed font-sans">
            {product.sevaGuidelines.chandanKumkum}
          </p>
        </div>

        {/* Transit & Installation */}
        <div className="bg-[#FFFDF5] p-6 rounded-lg border border-[#D4AF37]/25 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 text-[#8B5A2B]">
            <Box className="w-5 h-5 text-[#8B5A2B]" />
            <h4 className="font-serif text-lg font-bold text-[#3A2D20]">
              Transit & Installation
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5248] leading-relaxed font-sans">
            {product.sevaGuidelines.transitInstallation}
          </p>
        </div>
      </div>

      {/* Book Acharya Guidance Banner */}
      <div className="p-6 rounded-lg bg-[#F5F2ED] border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-serif text-lg font-bold text-[#3A2D20]">
            Need Guidance on Sthapana & Consecration?
          </h4>
          <p className="text-xs text-[#5C5248] font-sans">
            Our resident Varanasi Acharyas offer 1-on-1 virtual video-consultation for your home
            mandir sthapana and auspicious muhurat.
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          className="font-serif uppercase tracking-wider text-xs px-6 py-2.5 shrink-0"
        >
          Book Acharya
        </Button>
      </div>
    </div>
  );

  // Tab 3: Devotee Testimonials & Blessed Altars
  const testimonialsContent = (
    <div id="testimonials" className="space-y-8">
      {/* Testimonials Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#D4AF37]/20 gap-4">
        <div>
          <span className="text-[11px] tracking-[0.25em] text-[#8B5A2B] uppercase font-serif font-bold block mb-1">
            SACRED TESTIMONIALS
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3A2D20]">
            Blessed Altars & Devotee Experiences
          </h3>
          <p className="text-xs sm:text-sm text-[#5C5248] mt-1 font-sans">
            Over 1,200 sanctums consecrated globally with Siya Ram Arts murtis.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#FFFDF5] p-3 rounded-md border border-[#D4AF37]/30 shadow-2xs shrink-0">
          <div className="text-center pr-3 border-r border-[#D4AF37]/20">
            <span className="font-serif text-3xl font-bold text-[#3A2D20]">5.0</span>
            <div className="flex items-center text-[#D4AF37] text-xs mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
              ))}
            </div>
            <span className="text-[10px] text-[#8C8276] block mt-0.5">48 Reviews</span>
          </div>
          <div className="text-xs font-serif space-y-1">
            <span className="text-[#8B5A2B] font-bold block">
              100% Consecration Satisfaction
            </span>
            <span className="text-[11px] text-[#5C5248] block font-sans">
              Safe Transit to USA, UK, UAE & Bharat
            </span>
            <a href="#write-review" className="text-[#8B5A2B] hover:underline text-[11px] font-bold">
              Write Devotee Experience
            </a>
          </div>
        </div>
      </div>

      {/* Devotee Photo Altars Gallery */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ALL_REVIEWS.map((rev) => (
          <div
            key={rev.id}
            className="rounded-md overflow-hidden border border-[#D4AF37]/25 bg-[#FFFDF5] group shadow-2xs hover:shadow-md transition-shadow"
          >
            <div className="relative h-48 w-full bg-[#1C1814] overflow-hidden">
              <img
                src={rev.image}
                alt={rev.altarName || rev.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <span className="text-[10px] font-serif block truncate font-semibold">
                  {rev.altarName}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Text Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {ALL_REVIEWS.slice(0, 3).map((review) => (
          <div
            key={review.id}
            className="p-5 rounded-md bg-[#FFFDF5] border border-[#D4AF37]/25 space-y-3 flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2">
              <div className="flex items-center text-[#D4AF37]">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                ))}
              </div>
              <h4 className="font-serif text-sm font-bold text-[#3A2D20]">
                {review.title}
              </h4>
              <p className="text-xs text-[#5C5248] leading-relaxed font-sans">
                "{review.content}"
              </p>
            </div>
            <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between text-[11px] text-[#5C5248] font-serif">
              <span className="font-bold text-[#3A2D20]">{review.author}</span>
              <span className="text-[#8B5A2B] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#8B5A2B]" /> Verified Patron
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs: TabItem[] = [
    {
      id: 'specifications',
      label: 'Sacred Specifications',
      icon: <FileText className="w-4 h-4" />,
      content: specificationsContent,
    },
    {
      id: 'seva',
      label: 'Consecration & Daily Seva Guidelines',
      icon: <Sparkles className="w-4 h-4" />,
      content: sevaContent,
    },
    {
      id: 'testimonials',
      label: 'Blessed Altars & Devotee Experiences',
      count: '48',
      icon: <MessageSquare className="w-4 h-4" />,
      content: testimonialsContent,
    },
  ];

  return (
    <section className="py-12 border-t border-[#D4AF37]/20">
      <Tabs items={tabs} defaultTabId="specifications" />
    </section>
  );
};
