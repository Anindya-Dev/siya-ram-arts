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
    <section className="relative pt-14 pb-20 overflow-hidden bg-[#16110D] text-[#FFFDF9]">
      {/* Sacred Atelier Hero Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 mix-blend-luminosity scale-105"
        style={{ backgroundImage: "url('/hero-image.webp')" }}
      />
      {/* Rich Atmospheric Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#16110D]/90 via-[#16110D]/75 to-[#16110D]" />
      {/* Divine Golden Ambient Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[340px] bg-[#D4AF37]/12 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Badge */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#261E17]/90 border border-[#D4AF37]/45 text-[#EAD8BF] text-xs font-serif tracking-[0.2em] uppercase shadow-md backdrop-blur-xs">
            <Sparkle weight="fill" className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Sacred Sculpture & Temple Artisanship</span>
            <Sparkle weight="fill" className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>

          {/* Main Display H1 */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FFFDF9] leading-[1.15]">
            Divine Presences, Handcrafted in <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#E8C581] font-serif">Chemical Resin</span> &{' '}
            <span className="italic font-normal text-[#E8C581] font-serif">Fine Composite</span>
          </h1>

          <p className="text-base sm:text-lg text-[#DCD1C4] max-w-2xl mx-auto font-sans leading-relaxed pt-2">
            Created strictly according to Shilpa Shastras by master generational artisans of
            Jalandhar. Consecrated with devotion for your home sanctum.
          </p>

          {/* Action Buttons - Mobile First Responsive & Natural Desktop Sizing */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto w-full sm:w-auto px-2 sm:px-0">
            <Button
              variant="gold"
              size="lg"
              onClick={onExploreClick}
              className="font-serif tracking-wider shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-sm sm:text-base py-3 sm:py-2.5 px-6 rounded-lg font-semibold"
            >
              <span>Explore Sacred Murtis</span>
              <ArrowRight className="w-4 h-4 ml-1.5 shrink-0" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onFeaturedClick}
              className="font-serif tracking-wider w-full sm:w-auto text-sm sm:text-base py-3 sm:py-2.5 px-6 rounded-lg font-semibold bg-[#261E17]/90 text-[#F5E7CF] border border-[#D4AF37]/40 hover:bg-[#352A20]"
            >
              <span>View Flagship Masterpiece</span>
            </Button>
          </div>

          {/* 4 Pillars of Vedic Trust */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 pb-6 text-xs text-[#DFCDBA] font-serif border-b border-[#D4AF37]/25">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck weight="bold" className="w-4 h-4 text-[#D4AF37]" />
              <span>100% Handcrafted by Sthapathis</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Package weight="bold" className="w-4 h-4 text-[#D4AF37]" />
              <span>Insured Sanctum Door-Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <DiamondsFour weight="bold" className="w-4 h-4 text-[#D4AF37]" />
              <span>Premium Chemical Resin Casting</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Flame weight="bold" className="w-4 h-4 text-[#D4AF37]" />
              <span>Temple-Consecrated Packaging</span>
            </div>
          </div>
        </div>

        {/* Featured Hero Frame: Swarna Vastra Kamadhenu Krishna Masterpiece */}
        <div className="mt-10 relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 shadow-2xl group cursor-pointer bg-[#14100D]/95 backdrop-blur-xs">
          <div
            onClick={onFeaturedClick}
            className="relative h-[420px] sm:h-[500px] lg:h-[560px] w-full"
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
  );
};
