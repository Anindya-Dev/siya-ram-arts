import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Box, Gem, Flame } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  onExploreClick?: () => void;
  onFeaturedClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick = () => {
    const el = document.getElementById('deities');
    el?.scrollIntoView({ behavior: 'smooth' });
  },
  onFeaturedClick = () => {
    const el = document.getElementById('deities');
    el?.scrollIntoView({ behavior: 'smooth' });
  },
}) => {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Badge */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF5] border border-[#D4AF37]/30 text-[#8B5A2B] text-xs font-serif tracking-[0.2em] uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Sacred Sculpture & Temple Artisanship</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>

          {/* Main Display H1 */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3A2D20] leading-[1.15]">
            Divine Presences, Handcrafted in <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#8B5A2B] font-serif">Chemical Resin</span> &{' '}
            <span className="italic font-normal text-[#8B5A2B] font-serif">Fine Composite</span>
          </h1>

          <p className="text-base sm:text-lg text-[#5C5248] max-w-2xl mx-auto font-sans leading-relaxed pt-2">
            Created strictly according to Shilpa Shastras by master generational artisans of
            Jalandhar. Consecrated with devotion for your home sanctum.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="gold"
              size="lg"
              onClick={onExploreClick}
              className="font-serif uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              <span>Explore Sacred Murtis</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onFeaturedClick}
              className="font-serif uppercase tracking-wider"
            >
              <span>View Flagship Masterpiece</span>
            </Button>
          </div>

          {/* 4 Pillars of Vedic Trust */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 pb-6 text-xs text-[#5C5248] font-serif border-b border-[#D4AF37]/20">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A67C52]" />
              <span>100% Handcrafted by Sthapathis</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Box className="w-4 h-4 text-[#A67C52]" />
              <span>Insured Sanctum Door-Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Gem className="w-4 h-4 text-[#A67C52]" />
              <span>Premium Chemical Resin Casting</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-[#A67C52]" />
              <span>Temple-Consecrated Packaging</span>
            </div>
          </div>
        </div>

        {/* Featured Hero Frame: Swarna Vastra Kamadhenu Krishna Masterpiece */}
        <div className="mt-10 relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-xl group cursor-pointer bg-[#1A1613]">
          <div
            onClick={onFeaturedClick}
            className="relative h-[420px] sm:h-[500px] lg:h-[560px] w-full"
          >
            {/* Background Atmosphere Image */}
            <img
              src="/static/idols/swarna-vastra-kamadhenu-krishna.webp"
              alt="Swarna Vastra Kamadhenu Krishna Masterpiece"
              className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-700 p-6 bg-[#1A1613]"
              loading="eager"
            />
            {/* Soft Warm Vignette Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#14100D] via-[#14100D]/30 to-transparent pointer-events-none" />

            {/* Featured Caption Card */}
            <div className="absolute bottom-6 left-6 right-6 sm:left-10 sm:right-10 flex flex-col md:flex-row md:items-end justify-between gap-6 text-[#FAF9F6]">
              <div className="max-w-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#E5D5BC] font-serif font-semibold">
                    Jalandhar Heritage Flagship Masterpiece
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-wide text-[#FFFDF9]">
                  Swarna Vastra Kamadhenu Krishna Masterpiece
                </h2>
                <p className="text-xs sm:text-sm text-[#E2D8CD] leading-relaxed line-clamp-2 sm:line-clamp-none font-sans">
                  Hand-draped in genuine 24K gold foil leaf by master sculptors of Jalandhar. Standing on clouds with Kamadhenu cow and gold-filigree rim pedestal.
                </p>
              </div>

              {/* Sanctum Spec Tag and Action */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-[#26201A]/80 backdrop-blur-md px-4 py-2.5 rounded-sm border border-[#52463A] text-right">
                  <span className="text-[10px] uppercase tracking-widest text-[#BFA68A] block font-serif">
                    Sanctum Height
                  </span>
                  <span className="font-serif text-sm sm:text-base font-bold text-[#FAF9F6]">
                    18 Inches • 17.5kg
                  </span>
                </div>
                <div className="w-12 h-12 rounded-sm bg-[#8B5A2B] hover:bg-[#724923] text-white flex items-center justify-center transition-colors shadow-md group-hover:scale-105">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
