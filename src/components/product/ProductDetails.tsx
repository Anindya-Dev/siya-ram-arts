import React, { useState } from 'react';
import {
  Star,
  Check,
  ShieldCheck,
  Box,
  Truck,
  FileCheck,
  Ruler,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Heart,
  Share2,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (
    product: Product,
    selectedSize: string,
    selectedMaterial: string,
    selectedOrnamentation: string,
    quantity: number
  ) => void;
  onRequestConsecration: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onAddToCart,
  onRequestConsecration,
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState('Chemical Resin');
  const [selectedHeight, setSelectedHeight] = useState('18-inch');
  const [selectedOrnamentation, setSelectedOrnamentation] = useState(
    '24K Gold Leaf Vark & Real Emerald Coloration'
  );
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Find active variant
  const activeVariant: ProductVariant =
    product.variants.find((v) => v.size.includes(selectedHeight)) ||
    product.variants[2] ||
    product.variants[0];

  const ornamentationAdjustment =
    selectedOrnamentation.includes('Unpainted') ? -4500 : 0;
  const unitPrice =
    product.basePrice + (activeVariant?.priceDelta || 0) + ornamentationAdjustment;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Category Eyebrow & Actions */}
      <div className="flex items-center justify-between pb-1 border-b border-[#D4AF37]/20">
        <div className="text-[10px] sm:text-xs font-serif tracking-[0.2em] uppercase text-[#8B5A2B] font-bold">
          GENERATIONAL CRAFT • {product.atelier}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            aria-label="Save to Sanctum Wishlist"
            className="p-1.5 rounded-full text-[#5C5248] hover:text-[#A34D3D] hover:bg-[#F5F2ED] transition-colors"
          >
            <Heart className={cn('w-4 h-4', isWishlisted && 'fill-[#A34D3D] text-[#A34D3D]')} />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share product"
            className="p-1.5 rounded-full text-[#5C5248] hover:text-[#8B5A2B] hover:bg-[#F5F2ED] transition-colors relative"
          >
            <Share2 className="w-4 h-4" />
            {shareSuccess && (
              <span className="absolute -top-7 right-0 bg-[#2D2D2D] text-white text-[10px] px-2 py-0.5 rounded font-sans whitespace-nowrap">
                Link Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Product Title */}
      <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#3A2D20] leading-[1.25]">
        {product.name}
      </h1>

      {/* Ratings & Consecrated Heritage Pill */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C5248]">
        <div className="flex items-center gap-1 text-[#D4AF37]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
          ))}
        </div>
        <span className="font-bold text-[#3A2D20]">{product.rating.toFixed(1)}</span>
        <a href="#testimonials" className="hover:underline hover:text-[#8B5A2B]">
          {product.reviewCount} Verified Devotee Reviews
        </a>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFDF5] text-[#8B5A2B] text-[10px] font-serif uppercase tracking-wider font-semibold border border-[#D4AF37]/30 shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Consecrated Heritage
        </span>
      </div>

      {/* Price Block */}
      <div className="p-4 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/25 space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#8B5A2B]">
            {formatCurrency(unitPrice)}
          </span>
          {product.originalPrice && (
            <span className="text-sm sm:text-base text-[#8C8276] line-through font-serif">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          {product.discountBadge && (
            <span className="text-[11px] font-serif uppercase tracking-wider px-2 py-0.5 rounded-xs bg-[#A34D3D]/10 border border-[#A34D3D]/30 text-[#A34D3D] font-bold">
              {product.discountBadge}
            </span>
          )}
        </div>
        <p className="text-xs text-[#5C5248]">
          Includes custom weatherproof teak shipping crate, multi-tier transit insurance & GST.
        </p>
      </div>

      {/* Sculpting Stone / Metal Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-serif">
          <span className="uppercase tracking-wider font-semibold text-[#3A2D20]">
            Medium / Finish:
          </span>
          <span className="text-[#8B5A2B] font-medium">{product.materialPurity}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs font-serif">
          {[
            { id: 'Chemical Resin', label: 'Chemical Resin', sub: 'White Stone Finish' },
            { id: 'Antique Casting', label: 'Antique Casting', sub: 'Metallic Patina' },
            { id: 'Black Resin', label: 'Black Resin', sub: 'Black Shila Finish' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedMaterial(item.id)}
              className={cn(
                'p-2.5 rounded-sm border text-left transition-all',
                selectedMaterial === item.id
                  ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-2xs'
                  : 'bg-white text-[#5C5248] border-[#D4AF37]/30 hover:border-[#8B5A2B]'
              )}
            >
              <span className="block font-semibold">{item.label}</span>
              <span
                className={cn(
                  'text-[10px] block mt-0.5',
                  selectedMaterial === item.id ? 'text-[#FAF9F6]/80' : 'text-[#8C8276]'
                )}
              >
                {item.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sanctum Height Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-serif">
          <span className="uppercase tracking-wider font-semibold text-[#3A2D20]">
            Sanctum Height:
          </span>
          <button
            type="button"
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            className="text-[#8B5A2B] hover:underline flex items-center gap-1 font-semibold"
          >
            <Ruler className="w-3 h-3" />
            <span>Mandir Size Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-serif">
          {[
            { size: '9-inch', label: '9-inch', note: 'Small Altar', avail: '4 available' },
            { size: '15-inch', label: '15-inch', note: 'Standard Home', avail: '3 available' },
            { size: '18-inch', label: '18-inch', note: 'Ayodhya Scale', avail: '1 left (Low)' },
            { size: '24-inch', label: '24-inch', note: 'Temple Sabha', avail: 'Custom Order' },
          ].map((h) => {
            const isSelected = selectedHeight === h.size;
            return (
              <button
                key={h.size}
                type="button"
                onClick={() => setSelectedHeight(h.size)}
                className={cn(
                  'p-2.5 rounded-sm border text-left relative transition-all',
                  isSelected
                    ? 'bg-[#8B5A2B] text-white border-[#724923] shadow-2xs ring-1 ring-[#8B5A2B]'
                    : 'bg-white text-[#5C5248] border-[#D4AF37]/30 hover:border-[#8B5A2B]'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{h.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </div>
                <span
                  className={cn(
                    'text-[10px] block mt-0.5',
                    isSelected ? 'text-[#FAF9F6]/80' : 'text-[#7D7369]'
                  )}
                >
                  {h.note}
                </span>
                <span
                  className={cn(
                    'text-[9px] block mt-1 font-sans',
                    isSelected
                      ? 'text-[#D4AF37]'
                      : h.avail.includes('Low')
                      ? 'text-[#A34D3D] font-bold'
                      : 'text-[#8C8176]'
                  )}
                >
                  {h.avail}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mandir Size Guide Modal Callout */}
        {showSizeGuide && (
          <div className="p-4 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/30 text-xs text-[#5C5248] space-y-2">
            <div className="flex items-center justify-between font-serif font-bold text-[#3A2D20]">
              <span>Altar Clearance Recommendations</span>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-xs hover:underline text-[#8B5A2B]"
              >
                Close
              </button>
            </div>
            <p className="leading-relaxed font-sans">
              For home altars with height 24" to 30", an <strong>18-inch murti</strong> provides
              ideal proportion leaving 6" to 12" head clearance for the Chhatra (sacred umbrella)
              and daily flower garlands.
            </p>
          </div>
        )}
      </div>

      {/* Ornamentation & Paintwork Selector */}
      <div className="space-y-2.5">
        <span className="text-xs font-serif uppercase tracking-wider font-semibold text-[#3A2D20] block">
          Ornamentation & Paintwork:
        </span>
        <div className="space-y-2 text-xs">
          <label
            className={cn(
              'flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-colors',
              selectedOrnamentation.includes('24K Gold')
                ? 'bg-[#FFFDF5] border-[#8B5A2B] ring-1 ring-[#8B5A2B]'
                : 'bg-white border-[#D4AF37]/30 hover:border-[#8B5A2B]'
            )}
          >
            <input
              type="radio"
              name="ornamentation"
              checked={selectedOrnamentation.includes('24K Gold')}
              onChange={() =>
                setSelectedOrnamentation('24K Gold Leaf Vark & Real Emerald Coloration')
              }
              className="mt-0.5 text-[#8B5A2B] focus:ring-[#8B5A2B]"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between font-serif font-semibold text-[#3A2D20]">
                <span>24K Gold Leaf Vark & Real Emerald Coloration</span>
                <span className="text-[#8B5A2B] font-bold">Selected</span>
              </div>
              <p className="text-[11px] text-[#5C5248] mt-0.5 font-sans">
                Pure gold leaf applied navratna ornaments and golden bow.
              </p>
            </div>
          </label>

          <label
            className={cn(
              'flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-colors',
              selectedOrnamentation.includes('Unpainted')
                ? 'bg-[#FFFDF5] border-[#8B5A2B] ring-1 ring-[#8B5A2B]'
                : 'bg-white border-[#D4AF37]/30 hover:border-[#8B5A2B]'
            )}
          >
            <input
              type="radio"
              name="ornamentation"
              checked={selectedOrnamentation.includes('Unpainted')}
              onChange={() =>
                setSelectedOrnamentation('Pristine Polished White Finish (Unpainted)')
              }
              className="mt-0.5 text-[#8B5A2B] focus:ring-[#8B5A2B]"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between font-serif font-semibold text-[#3A2D20]">
                <span>Pristine Polished White Finish (Unpainted)</span>
                <span className="text-[#A67C52]">- ₹4,500</span>
              </div>
              <p className="text-[11px] text-[#5C5248] mt-0.5 font-sans">
                Smooth satin chemical polymer finish, ideal for regular milk and water abhishek.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Stock Alert Pill (Terracotta Alert) */}
      <div className="p-3 rounded-sm bg-[#A34D3D]/10 border border-[#A34D3D]/30 flex items-center gap-2.5 text-xs text-[#A34D3D] font-serif font-medium">
        <AlertCircle className="w-4 h-4 shrink-0 text-[#A34D3D]" />
        <span>
          Only <strong>2 handcrafted pieces remaining</strong> in this auspicious
          Sankranti casting batch.
        </span>
      </div>

      {/* Quantity & Add to Cart Row */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          {/* Stepper */}
          <div className="flex items-center border border-[#D4AF37]/30 rounded-sm bg-[#FFFDF5] overflow-hidden h-12 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 text-[#5C5248] hover:text-[#3A2D20] hover:bg-[#F5F2ED] transition-colors focus:outline-none"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm text-[#3A2D20]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 text-[#5C5248] hover:text-[#3A2D20] hover:bg-[#F5F2ED] transition-colors focus:outline-none"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Sacred Cart Primary CTA */}
          <Button
            variant="gold"
            size="lg"
            fullWidth
            onClick={() =>
              onAddToCart(
                product,
                selectedHeight,
                selectedMaterial,
                selectedOrnamentation,
                quantity
              )
            }
            className="h-12 font-serif text-sm uppercase tracking-wider font-bold shadow-md"
          >
            <span>Add to Sacred Cart</span>
          </Button>
        </div>

        {/* Secondary Consecration Reservation CTA */}
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={onRequestConsecration}
          className="font-serif text-xs uppercase tracking-widest py-3 border border-[#8B5A2B]/40 bg-[#FFFDF5] text-[#8B5A2B] hover:bg-[#F5F2ED] font-bold"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1 text-[#8B5A2B]" />
          <span>Reserve & Request Consecration (Prana Pratishtha)</span>
        </Button>

        {/* WhatsApp Inquiry Button */}
        <a
          href={`https://wa.me/919876286046?text=${encodeURIComponent(
            `Namaste Siya Ram Arts! 🙏\n\nI am interested in purchasing this sacred murti:\n• Product: ${product.name}\n• SKU: ${product.sku}\n• Size: ${selectedHeight}\n• Offering Price: ₹${unitPrice.toLocaleString('en-IN')}\n\nPlease share consecration details, availability, and delivery timeline.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-sm bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <span>Inquire on WhatsApp (+91 98762 86046)</span>
        </a>
      </div>

      {/* 4 Trust Badges */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#D4AF37]/25 text-xs text-[#5C5248] font-serif">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#8B5A2B] shrink-0" />
          <div>
            <span className="font-bold text-[#3A2D20] block">Vedic Artisans</span>
            <span className="text-[10px] text-[#8C8276] font-sans">100% hand-carved in Rajasthan</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Box className="w-4 h-4 text-[#8B5A2B] shrink-0" />
          <div>
            <span className="font-bold text-[#3A2D20] block">Zero-Damage Transit</span>
            <span className="text-[10px] text-[#8C8276] font-sans">Triple-cushioned wooden box</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-[#8B5A2B] shrink-0" />
          <div>
            <span className="font-bold text-[#3A2D20] block">Insured Freight</span>
            <span className="text-[10px] text-[#8C8276] font-sans">Door-to-altar transit protection</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <FileCheck className="w-4 h-4 text-[#8B5A2B] shrink-0" />
          <div>
            <span className="font-bold text-[#3A2D20] block">Sanctum Deed</span>
            <span className="text-[10px] text-[#8C8276] font-sans">Includes authenticity certificate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
