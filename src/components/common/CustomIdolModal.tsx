import React, { useState } from 'react';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { getCustomIdolWhatsAppUrl, WhatsAppConfig } from '../../lib/whatsapp';

interface CustomIdolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomIdolModal: React.FC<CustomIdolModalProps> = ({ isOpen, onClose }) => {
  const [deity, setDeity] = useState('Shri Krishna');
  const [customDeity, setCustomDeity] = useState('');
  const [size, setSize] = useState('18-inch (1.5 ft)');
  const [material, setMaterial] = useState('Chemical Resin (White Stone Finish)');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const activeDeity = deity === 'Other' ? customDeity || 'Custom Swaroop' : deity;

  const whatsappUrl = getCustomIdolWhatsAppUrl({
    deity: activeDeity,
    size,
    material,
    location,
    notes,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FAF9F6] rounded-xl border border-[#D4AF37]/40 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#F5F2ED] border-b border-[#D4AF37]/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold shadow-2xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.2em] text-[#8B5A2B] uppercase font-serif font-bold block">
                DIRECT WHATSAPP DESK • {WhatsAppConfig.DISPLAY_PHONE}
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#3A2D20]">
                Custom Idol / Bespoke Order Inquiry
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8C8276] hover:text-[#3A2D20] hover:bg-[#EAE4DC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <p className="text-xs text-[#5C5248] font-sans leading-relaxed">
            Specify your requirements below to generate a pre-formatted custom order template.
            Clicking send will connect you directly to our Jalandhar Master Carver on WhatsApp (<strong>{WhatsAppConfig.DISPLAY_PHONE}</strong>).
          </p>

          {/* Deity Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Deity / Swaroop *
              </label>
              <select
                value={deity}
                onChange={(e) => setDeity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20] font-serif"
              >
                <option value="Shri Krishna">Shri Krishna</option>
                <option value="Radha Krishna Yugal">Radha Krishna Yugal</option>
                <option value="Gautam Buddha">Gautam Buddha</option>
                <option value="Shiv Parivar & Mahadev">Shiv Parivar & Mahadev</option>
                <option value="Shri Ganesha">Shri Ganesha</option>
                <option value="Devi Durga / Lakshmi">Devi Durga / Lakshmi</option>
                <option value="Lord Ram / Ram Lalla">Lord Ram / Ram Lalla</option>
                <option value="Lord Hanuman">Lord Hanuman</option>
                <option value="Other">Other Custom Form...</option>
              </select>
            </div>

            {deity === 'Other' && (
              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                  Specify Swaroop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maa Saraswati, Nataraja, etc."
                  value={customDeity}
                  onChange={(e) => setCustomDeity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Preferred Height / Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20] font-serif"
              >
                <option value="9-inch (Compact Altars)">9-inch (Compact Altars)</option>
                <option value="12-inch (Sanctum Standard)">12-inch (Sanctum Standard)</option>
                <option value="18-inch (1.5 ft)">18-inch (1.5 ft)</option>
                <option value="24-inch (2 ft)">24-inch (2 ft)</option>
                <option value="36-inch (3 ft Mandir)">36-inch (3 ft Mandir)</option>
                <option value="48-inch+ (Community Temple)">48-inch+ (Community Temple)</option>
              </select>
            </div>
          </div>

          {/* Material & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Preferred Material & Finish
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20] font-serif"
              >
                <option value="Chemical Resin (White Stone Finish)">Chemical Resin (White Stone)</option>
                <option value="Chemical Resin (Black Shila Finish)">Chemical Resin (Black Shila)</option>
                <option value="Makrana White Marble">Makrana White Marble</option>
                <option value="Chemical Casting (Antique Metallic)">Chemical Casting (Antique Metallic)</option>
                <option value="24K Gold Foil Leaf Layered">24K Gold Foil Leaf Layered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Delivery City & State
              </label>
              <input
                type="text"
                placeholder="e.g. Jalandhar, Punjab / New Delhi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
              Custom Reference / Specific Vastu Guidelines
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Specific mudra, pedestal style, color accents, or custom temple space dimensions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20]"
            />
          </div>

          {/* Live Message Format Preview */}
          <div className="p-3.5 rounded-lg bg-[#E8F5E9] border border-[#A5D6A7] space-y-1.5 text-xs text-[#1B5E20]">
            <div className="flex items-center gap-1.5 font-bold font-serif text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Formatted WhatsApp Message Template Preview:</span>
            </div>
            <pre className="p-2 bg-white/80 rounded text-[11px] font-mono text-[#2E7D32] whitespace-pre-wrap leading-relaxed border border-[#C8E6C9]">
{`Namaste Siya Ram Arts! 🙏

I would like to order / inquire about a Custom Handcrafted Idol:
• Deity / God Form: ${activeDeity}
• Height / Size: ${size}
• Preferred Material: ${material}
• Delivery Location: ${location || 'India'}
${notes ? `• Specific Details: ${notes}\n` : ''}
Please share pricing estimation, crafting timeframe, and Vastu guidance.`}
            </pre>
          </div>

          {/* Form Action */}
          <div className="pt-3 border-t border-[#D4AF37]/25 flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#8C8276] font-serif">
              Direct Desk: <strong>{WhatsAppConfig.DISPLAY_PHONE}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="px-5 py-2 rounded-sm bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-serif font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to WhatsApp</span>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
