import React from 'react';
import { Sparkle, ArrowRight, ShieldCheck, Package, DiamondsFour, Flame } from '@phosphor-icons/react';
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
    <>
      {/* Primary Hero Section with Authentic Background Image */}
      <section className="relative pt-14 pb-20 sm:pt-20 sm:pb-24 overflow-hidden bg-[#FAF9F6] border-b border-[#D4AF37]/25 min-h-[560px] sm:min-h-[640px] lg:min-h-[700px] flex items-center justify-center">
        {/* Full Authentic Hero Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-bottom sm:bg-bottom bg-no-repeat"
          style={{ backgroundImage: "url('/hero-image.webp')" }}
        />
        {/* Soft natural tint for flawless text legibility while keeping deities crisp */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5]/70 via-transparent to-[#FAF9F6]/80 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 my-auto">
          {/* Top Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF5]/95 border border-[#D4AF37]/40 text-[#8B5A2B] text-xs font-serif tracking-[0.2em] uppercase shadow-2xs backdrop-blur-xs">
            <Sparkle weight="fill" className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Sacred Sculpture & Temple Artisanship</span>
            <Sparkle weight="fill" className="w-3.5 h-3.5 text-[#D4AF37]" />
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
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto w-full sm:w-auto px-2 sm:px-0">
            <Button
              variant="gold"
              size="lg"
              onClick={onExploreClick}
              className="font-serif tracking-wider shadow-sm hover:shadow-md transition-all w-full sm:w-auto text-sm sm:text-base py-3 sm:py-2.5 px-6 rounded-lg font-semibold"
            >
              <span>Explore Sacred Murtis</span>
              <ArrowRight className="w-4 h-4 ml-1.5 shrink-0" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onFeaturedClick}
              className="font-serif tracking-wider w-full sm:w-auto text-sm sm:text-base py-3 sm:py-2.5 px-6 rounded-lg font-semibold bg-[#FFFDF5]/90 border border-[#D4AF37]/50 text-[#8B5A2B] hover:bg-[#8B5A2B] hover:text-white transition-colors"
            >
              <span>View Flagship Masterpiece</span>
            </Button>
          </div>

          {/* 4 Pillars of Vedic Trust */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 text-xs text-[#5C5248] font-serif border-t border-[#D4AF37]/25">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck weight="bold" className="w-4 h-4 text-[#8B5A2B]" />
              <span>100% Handcrafted</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Package weight="bold" className="w-4 h-4 text-[#8B5A2B]" />
              <span>Insured Sanctum Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <DiamondsFour weight="bold" className="w-4 h-4 text-[#8B5A2B]" />
              <span>Chemical Resin Casting</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Flame weight="bold" className="w-4 h-4 text-[#8B5A2B]" />
              <span>Temple Packaging</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Masterpiece Spotlight Section */}
      <section className="py-12 bg-[#F5F2ED] border-b border-[#D4AF37]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 shadow-xl group cursor-pointer bg-[#14100D]">
            <div
              onClick={onFeaturedClick}
              className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full"
            >
              {/* Background Atmosphere Image */}
              <img
                src="/static/idols/swarna-vastra-kamadhenu-krishna.webp"
                alt="Swarna Vastra Kamadhenu Krishna Masterpiece"
                className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-700 p-6 bg-[#14100D]"
                loading="eager"
              />
              {/* Soft Warm Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B09] via-[#0E0B09]/30 to-transparent pointer-events-none" />

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
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
                  <div className="bg-[#26201A]/80 backdrop-blur-md px-3.5 py-2 rounded-md border border-[#52463A] text-left sm:text-right">
                    <span className="text-[10px] uppercase tracking-widest text-[#BFA68A] block font-serif">
                      Sanctum Scale
                    </span>
                    <span className="font-serif text-xs sm:text-sm font-bold text-[#FAF9F6]">
                      18 In • 17.5kg
                    </span>
                  </div>
                  <div className="h-10 px-4 rounded-md bg-[#8B5A2B] hover:bg-[#724923] text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs sm:text-sm font-serif font-semibold shrink-0">
                    <span>View Murti</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
