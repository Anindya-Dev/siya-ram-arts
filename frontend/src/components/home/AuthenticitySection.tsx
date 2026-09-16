import React from 'react';
import { Star, ShieldCheck, Eye, Compass, Award } from 'lucide-react';

export const AuthenticitySection: React.FC = () => {
  return (
    <section id="about-us" className="py-24 bg-[#FAF9F6] border-b border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Lineage Photo & Canon Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-[#D4AF37]/30 shadow-lg bg-[#1F1A16]">
              <img
                src="/static/idols/siya-ram-arts-brand-medallion.png"
                alt="Siya Ram Arts Official Atelier Seal"
                className="w-full h-[440px] object-contain object-center p-4 bg-[#FFFDF5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Lineage Overlay Tag */}
              <div className="absolute bottom-5 left-5 right-5 text-[#FAF9F6]">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#DFCBB5] font-serif block">
                  Generational Sthapathi Lineage
                </span>
                <h4 className="font-serif text-lg font-bold text-[#FFFDF9]">
                  Master Artisans of Jalandhar Studio
                </h4>
                <p className="text-xs text-[#D8CDC0]">
                  Gandhi Nagar, Jalandhar, Punjab - 144001 • Primary Sanctum Atelier
                </p>
              </div>
            </div>

            {/* Talamana Card Callout */}
            <div className="p-5 rounded-md bg-[#8B5A2B] text-[#FAF9F6] border border-[#724923] flex items-start gap-4 shadow-sm">
              <div className="p-2.5 rounded-sm bg-[#724923] text-[#D4AF37] shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-serif font-bold block">
                  Talamana System
                </span>
                <p className="text-xs sm:text-sm text-[#F5F2ED] leading-relaxed font-sans">
                  Exact mathematical canons prescribed in Manasara & Shilpa Shastras, governing
                  divine facial proportions and spiritual resonance.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Devotee Testimony */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[11px] tracking-[0.25em] text-[#8B5A2B] uppercase font-serif font-bold block mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> ABOUT US • SIYA RAM ARTS HERITAGE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3A2D20] leading-[1.2]">
                Preserving Sacred Shilpa Shastras & Atelier Craft
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#5C5248] leading-relaxed font-sans">
                A sacred vigraha is not merely an artistic depiction; it is a conscious embodiment
                of divine vibration (<em>Devata Sannidhi</em>). At Siya Ram Arts, every master mold and finishing
                sculpture follows the strict mathematical <em>Angula</em> and <em>Talamana</em> measures
                codified in ancient temple treatises.
              </p>
            </div>

            {/* Two Sacred Principles */}
            <div className="space-y-5 pt-2">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-sm bg-[#FFFDF5] border border-[#D4AF37]/30 text-[#8B5A2B] shrink-0 mt-1 shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#3A2D20]">
                    Purity of Medium & Casting
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#5C5248] leading-relaxed font-sans">
                    Formulated with high-density chemical resin composite ensuring immaculate surface finish,
                    zero micro-cracks, and lifetime resilience to sacred abhishek and water offerings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-sm bg-[#FFFDF5] border border-[#D4AF37]/30 text-[#8B5A2B] shrink-0 mt-1 shadow-2xs">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#3A2D20]">
                    Netronmeelana (Opening of Divine Eyes)
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#5C5248] leading-relaxed font-sans">
                    Eyes are painted and revealed only on auspicious nakshatras during Brahma Muhurta by master
                    artisans observing sacred fasts and continuous chanting.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial Quote Box */}
            <div className="p-6 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/25 space-y-3 relative shadow-2xs">
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <blockquote className="italic font-serif text-sm sm:text-base text-[#3A2D20] leading-relaxed">
                "The moment our Ram Lalla arrived at our Austin home, the whole room felt
                transformed with quiet, divine stillness. The consecrated packaging was immaculate."
              </blockquote>
              <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs text-[#5C5248] font-serif">
                <span className="font-bold text-[#3A2D20]">
                  Dr. Arvind & Meenakshi S.
                </span>
                <span>Austin, Texas • Consecrated Oct 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
