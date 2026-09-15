import React, { useState } from 'react';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Sparkles, Check, Calendar, User, Home, ShieldCheck } from 'lucide-react';

interface ConsecrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export const ConsecrationModal: React.FC<ConsecrationModalProps> = ({
  isOpen,
  onClose,
  productName = 'Sacred Murti',
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    patronName: '',
    phone: '',
    email: '',
    gotra: '',
    nakshatra: '',
    preferredDate: '',
    mandirDetails: '',
    priestService: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3000);
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Sacred Prana Pratishtha Consecration"
      subtitle={`Vedic Ritual Registration for ${productName}`}
    >
      {submitted ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#8B5A2B]/15 text-[#8B5A2B] flex items-center justify-center mx-auto border border-[#8B5A2B]/30">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#3A2D20]">
            Sankalpa Registered
          </h3>
          <p className="text-xs text-[#5C5248] max-w-sm mx-auto leading-relaxed font-sans">
            Our Head Varanasi Acharya will reach out to confirm your auspicious Muhurat and
            personalize the Vedic mantra ritual for your home sanctum.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-xs text-[#3A2D20]">
          <div className="p-3.5 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/30 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[#8B5A2B] font-serif font-bold">
              <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
              <span>Devata Sannidhi & Sankalpa</span>
            </div>
            <p className="text-[11px] text-[#5C5248] leading-relaxed font-sans">
              Every vigraha can be consecrated with specific family gotra sankalpa prior to
              weatherproof packing at our Varanasi or Jaipur Vedic Peeth.
            </p>
          </div>

          {/* Patron Details */}
          <div className="space-y-3">
            <label className="font-serif font-bold text-[#3A2D20] block uppercase tracking-wider text-[11px]">
              Patron & Family Information
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#8C8276] block mb-1 font-medium">
                  Full Name (Karta) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arvind Sharma"
                  value={formData.patronName}
                  onChange={(e) => setFormData({ ...formData, patronName: e.target.value })}
                  className="w-full p-2.5 rounded-sm bg-[#FFFDF5] border border-[#D4AF37]/30 text-xs font-serif text-[#3A2D20] focus:border-[#8B5A2B] focus:outline-none shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#8C8276] block mb-1 font-medium">
                  WhatsApp / Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 / +1 ..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-sm bg-[#FFFDF5] border border-[#D4AF37]/30 text-xs font-serif text-[#3A2D20] focus:border-[#8B5A2B] focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#8C8276] block mb-1 font-medium">
                  Family Gotra (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bharadwaj / Kashyap"
                  value={formData.gotra}
                  onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                  className="w-full p-2.5 rounded-sm bg-[#FFFDF5] border border-[#D4AF37]/30 text-xs font-serif text-[#3A2D20] focus:border-[#8B5A2B] focus:outline-none shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#8C8276] block mb-1 font-medium">
                  Birth Nakshatra (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohini / Pushya"
                  value={formData.nakshatra}
                  onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
                  className="w-full p-2.5 rounded-sm bg-[#FFFDF5] border border-[#D4AF37]/30 text-xs font-serif text-[#3A2D20] focus:border-[#8B5A2B] focus:outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Mandir Details */}
          <div className="space-y-2">
            <label className="font-serif font-bold text-[#3A2D20] block uppercase tracking-wider text-[11px]">
              Home Sanctum / Mandir Dimensions
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Teak wood altar 32 inches height, north-east facing room..."
              value={formData.mandirDetails}
              onChange={(e) => setFormData({ ...formData, mandirDetails: e.target.value })}
              className="w-full p-2.5 rounded-sm bg-[#FFFDF5] border border-[#D4AF37]/30 text-xs font-serif text-[#3A2D20] focus:border-[#8B5A2B] focus:outline-none shadow-2xs"
            />
          </div>

          {/* Vedic Priest Video Call Option */}
          <label className="flex items-start gap-2.5 p-3 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/30 cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              checked={formData.priestService}
              onChange={(e) => setFormData({ ...formData, priestService: e.target.checked })}
              className="mt-0.5 accent-[#8B5A2B] text-[#8B5A2B] focus:ring-[#8B5A2B]"
            />
            <div className="space-y-0.5">
              <span className="font-serif font-bold text-[#3A2D20] block text-xs">
                Request Virtual Muhurat Guidance with Acharya
              </span>
              <p className="text-[11px] text-[#5C5248] font-sans">
                Includes a 30-minute virtual live guidance session during unboxing and sthapana
                at your home altar.
              </p>
            </div>
          </label>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            fullWidth
            className="font-serif uppercase tracking-wider font-bold text-xs py-3"
          >
            Submit Sacred Sankalpa Request
          </Button>
        </form>
      )}
    </Sheet>
  );
};
