import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, Heart, Minus, Plus, Ruler, Share2, Sparkles, Star } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: string, selectedMaterial: string, selectedOrnamentation: string, quantity: number) => void;
  onRequestConsecration: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onAddToCart, onRequestConsecration }) => {
  const variants = useMemo(() => {
    const active = product.variants.filter((variant) => variant.isActive !== false);
    return active.length ? active : product.variants;
  }, [product.variants]);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setSelectedVariantId(variants[0]?.id || '');
    setQuantity(1);
  }, [product.id, variants]);

  const variant: ProductVariant | undefined = variants.find((item) => item.id === selectedVariantId) || variants[0];
  const stock = variant?.totalAvailableStock ?? variant?.stockCount ?? 0;
  const price = variant?.basePrice ?? product.basePrice;

  const copyLink = () => navigator.clipboard?.writeText?.(window.location.href);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
        <span className="text-[10px] sm:text-xs font-serif tracking-[0.2em] uppercase text-[#8B5A2B] font-bold">Generational Craft • {product.atelier}</span>
        <div className="flex gap-2">
          <button onClick={() => setWishlisted((value) => !value)} aria-label="Save to wishlist" className="p-1.5 text-[#5C5248] hover:text-[#A34D3D]"><Heart className={cn('w-4 h-4', wishlisted && 'fill-[#A34D3D] text-[#A34D3D]')} /></button>
          <button onClick={copyLink} aria-label="Copy product link" className="p-1.5 text-[#5C5248] hover:text-[#8B5A2B]"><Share2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#3A2D20] leading-tight">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#5C5248]">
          <span className="flex text-[#D4AF37]">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />)}</span>
          <span className="font-bold text-[#3A2D20]">{product.rating.toFixed(1)}</span>
          <span>{product.reviewCount} Verified Devotee Reviews</span>
        </div>
      </div>

      <div className="p-4 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/25">
        <span className="font-serif text-3xl sm:text-4xl font-bold text-[#8B5A2B]">{formatCurrency(price)}</span>
        {product.originalPrice && <span className="ml-3 text-sm text-[#8C8276] line-through">{formatCurrency(product.originalPrice)}</span>}
        <p className="mt-2 text-xs text-[#5C5248]">Includes GST and insured, protected delivery.</p>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between text-xs font-serif"><span className="uppercase tracking-wider font-semibold text-[#3A2D20]">Available size, material & finish</span><button onClick={() => setShowSizeGuide((value) => !value)} className="text-[#8B5A2B] inline-flex items-center gap-1"><Ruler className="w-3 h-3" /> Size Guide</button></div>
        {showSizeGuide && <p className="p-3 rounded-sm bg-[#F5F2ED] border border-[#D4AF37]/30 text-xs text-[#5C5248]">Choose the size that fits your altar and leaves enough clearance for garlands and daily seva.</p>}
        {variants.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-serif">
          {variants.map((item) => {
            const itemStock = item.totalAvailableStock ?? item.stockCount ?? 0;
            const selected = item.id === variant?.id;
            return <button key={item.id} type="button" onClick={() => setSelectedVariantId(item.id)} className={cn('p-3 rounded-sm border text-left transition-all', selected ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]' : 'bg-white text-[#5C5248] border-[#D4AF37]/30 hover:border-[#8B5A2B]')}>
              <span className="flex items-center justify-between font-bold"><span>{item.size}</span>{selected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}</span>
              <span className={cn('block mt-1', selected ? 'text-[#FAF9F6]/80' : 'text-[#7D7369]')}>{item.material || product.material} · {item.finish || 'Hand-finished'}</span>
              <span className={cn('block mt-1 text-[10px]', selected ? 'text-[#D4AF37]' : itemStock <= 2 ? 'text-[#A34D3D] font-bold' : 'text-[#8C8176]')}>{itemStock > 0 ? `${itemStock} available` : 'Currently unavailable'}</span>
            </button>;
          })}
        </div> : <p className="p-3 border border-[#D4AF37]/30 rounded-sm text-xs text-[#5C5248]">Variant details are being prepared. Please contact us for availability.</p>}
      </div>

      <div className="p-3 rounded-sm bg-[#A34D3D]/10 border border-[#A34D3D]/30 flex gap-2 text-xs text-[#A34D3D] font-serif"><AlertCircle className="w-4 h-4 shrink-0" /><span>{stock > 0 ? <>Only <strong>{stock} handcrafted {stock === 1 ? 'piece' : 'pieces'} remaining</strong> for the selected variant.</> : <>This selected variant is <strong>currently unavailable</strong>.</>}</span></div>

      <div className="flex gap-3">
        <div className="flex items-center border border-[#D4AF37]/30 rounded-sm bg-[#FFFDF5] h-12"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3"><Minus className="w-4 h-4" /></button><span className="w-8 text-center font-bold text-sm">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(stock || 1, value + 1))} className="p-3"><Plus className="w-4 h-4" /></button></div>
        <Button variant="gold" size="lg" fullWidth disabled={!variant || stock < 1} onClick={() => onAddToCart(product, variant?.size || '', variant?.material || product.material, variant?.finish || '', quantity)} className="h-12 font-serif text-sm uppercase tracking-wider font-bold">Add to Sacred Cart</Button>
      </div>
      <Button variant="outline" size="md" fullWidth onClick={onRequestConsecration} className="font-serif text-xs uppercase tracking-widest py-3"><Sparkles className="w-3.5 h-3.5" /> Reserve & Request Consecration</Button>
    </div>
  );
};
