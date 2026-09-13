import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#F5F2ED] border-t border-[#D4AF37]/20 pt-16 text-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-[#D4AF37]/20">
          {/* Brand Seal Column */}
          <div className="lg:col-span-2 space-y-4 pr-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#A67C52] flex items-center justify-center text-[#A67C52] text-xs font-serif italic bg-[#FFFDF5]">
                SR
              </div>
              <span className="font-serif text-2xl font-bold tracking-tighter text-[#8B5A2B]">
                Siya Ram Arts
              </span>
            </div>
            <p className="text-sm text-[#5C5248] leading-relaxed max-w-sm">
              Artisans of sacred presence. Dedicated to preserving Vedic iconographic
              authenticity through hand-crafted temple murtis in premium chemical resin casting,
              fine composites, and antique polychrome.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-serif tracking-widest text-[#8B5A2B] uppercase font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#A67C52]" />
              <span>Prana Pratishtha Consecrated</span>
            </div>
          </div>

          {/* Sacred Collections */}
          <div>
            <h3 className="font-serif text-xs font-bold tracking-[0.2em] uppercase text-[#3A2D20] mb-4">
              Collections
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#5C5248]">
              <li>
                <a href="#deities" className="hover:text-[#8B5A2B] transition-colors">
                  Shri Krishna Idols
                </a>
              </li>
              <li>
                <a href="#deities" className="hover:text-[#8B5A2B] transition-colors">
                  Radha Krishna Yugal
                </a>
              </li>
              <li>
                <a href="#deities" className="hover:text-[#8B5A2B] transition-colors">
                  Lord Buddha Idols
                </a>
              </li>
              <li>
                <a href="#deities" className="hover:text-[#8B5A2B] transition-colors">
                  Shiv Parivar & Mahadev
                </a>
              </li>
              <li>
                <a href="#deities" className="hover:text-[#8B5A2B] transition-colors">
                  Lord Ganesha Idols
                </a>
              </li>
              <li>
                <a href="#deities" className="hover:text-[#8B5A2B] transition-colors">
                  Devi Durga & Hanuman Ji
                </a>
              </li>
            </ul>
          </div>

          {/* Artisanship */}
          <div>
            <h3 className="font-serif text-xs font-bold tracking-[0.2em] uppercase text-[#3A2D20] mb-4">
              Artisanship
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#5C5248]">
              <li>
                <a href="#craft" className="hover:text-[#8B5A2B] transition-colors">
                  Chemical Resin Casting
                </a>
              </li>
              <li>
                <a href="#craft" className="hover:text-[#8B5A2B] transition-colors">
                  Durable Polymer Composite
                </a>
              </li>
              <li>
                <a href="#craft" className="hover:text-[#8B5A2B] transition-colors">
                  Antique Metallic Patina Finish
                </a>
              </li>
              <li>
                <a href="#craft" className="hover:text-[#8B5A2B] transition-colors">
                  Consecration & Ritual Guidance
                </a>
              </li>
              <li>
                <a href="#craft" className="hover:text-[#8B5A2B] transition-colors">
                  Jalandhar Atelier & Studio
                </a>
              </li>
            </ul>
          </div>

          {/* Devotee Care & Contact */}
          <div>
            <h3 className="font-serif text-xs font-bold tracking-[0.2em] uppercase text-[#3A2D20] mb-4">
              Studio & Contact
            </h3>
            <div className="text-xs text-[#5C5248] space-y-1.5 font-sans leading-relaxed">
              <p className="font-serif font-bold text-[#3A2D20]">Siya Ram Arts Atelier</p>
              <p>House No. 89, Near Muslim Colony,</p>
              <p>Gandhi Nagar, Jalandhar,</p>
              <p>Punjab - 144001, Bharat</p>

              <div className="pt-2">
                <a
                  href="https://wa.me/919876286046?text=Namaste%20Siya%20Ram%20Arts!%20%F0%9F%99%8F%0AI%20would%20like%20to%20inquire%20about%20your%20handcrafted%20sacred%20murtis%20and%20temple%20vigrahas."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#25D366] hover:underline font-bold font-serif text-xs"
                >
                  <span>💬 WhatsApp: +91 98762 86046</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Tones Sub-footer bar */}
      <div className="bg-[#FAF9F6] border-t border-[#D4AF37]/20 py-4 px-4 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-[#5C5248] font-bold">
        <div>&copy; 2025 Siya Ram Arts Studio • Jalandhar, Punjab</div>
        <div className="text-center">Secure Global Shipping • Insured Transit</div>
        <div>Shilpa Shastra Authentic</div>
      </div>
    </footer>
  );
};
