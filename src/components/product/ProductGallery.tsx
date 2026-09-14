import React, { useState } from 'react';
import { ExternalLink, Sparkles, RotateCw, ZoomIn, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProductImage } from '../../types';
import { getProductImageUrl } from '../../data/products';

interface ProductGalleryProps {
  images: ProductImage[];
  certificateNumber: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  certificateNumber,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [is360Mode, setIs360Mode] = useState(false);

  const activeImage = images[activeImageIndex] || images[0] || { url: '/static/idols/swarna-vastra-kamadhenu-krishna.png', alt: 'Sacred Murti' };


  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <div className="relative rounded-lg overflow-hidden border border-[#D4AF37]/30 bg-[#FFFFFF] shadow-sm">
        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#FFFDF5]/95 backdrop-blur-xs border border-[#D4AF37]/30 text-[#8B5A2B] text-[10px] font-serif uppercase tracking-widest font-bold shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Ayodhya Swaroop Edition</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#F5F2ED]/95 backdrop-blur-xs border border-[#D4AF37]/30 text-[#8B5A2B] text-[10px] font-serif uppercase tracking-widest font-bold shadow-2xs">
            <span>24K Gold Leaf Vark</span>
          </div>
        </div>

        {/* Main Display Image */}
        <div
          className={cn(
            'relative h-[480px] sm:h-[580px] w-full flex items-center justify-center p-4 overflow-hidden cursor-crosshair bg-gradient-to-b from-[#FFFDF5] to-[#FAF9F6]',
            isZoomed && 'scale-125 transition-transform duration-300'
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={getProductImageUrl(activeImage)}
            alt={activeImage.alt || 'Sacred Murti'}
            className={cn(
              'max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-300',
              is360Mode && 'animate-subtle-glow'
            )}
            loading="eager"
          />
        </div>

        {/* Floating Controls (360 view, Hover to inspect) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none text-xs text-[#5C5248]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIs360Mode(!is360Mode);
            }}
            className="pointer-events-auto px-3 py-1.5 rounded-sm bg-[#FFFDF5]/90 backdrop-blur-xs border border-[#D4AF37]/30 text-[#3A2D20] hover:text-[#8B5A2B] flex items-center gap-1.5 shadow-2xs font-serif text-[11px]"
          >
            <RotateCw className={cn('w-3.5 h-3.5', is360Mode && 'animate-spin text-[#8B5A2B]')} />
            <span>{is360Mode ? '360° Active' : '360° Murti View Available'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#FFFDF5]/90 backdrop-blur-xs border border-[#D4AF37]/30 text-[11px] font-serif text-[#5C5248]">
            <ZoomIn className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>Click to inspect sacred detailing</span>
          </div>
        </div>

        {/* Camera EXIF pill */}
        <div className="absolute bottom-12 right-4 text-[9px] text-[#8C8276] font-mono tracking-wider hidden sm:block pointer-events-none">
          Leica SL2, 50mm f/1.4, 1/160 sec, ISO 100
        </div>
      </div>

      {/* Thumbnail Reel */}
      <div className="grid grid-cols-5 gap-3">
        {images.map((img, idx) => {
          const isActive = idx === activeImageIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={cn(
                'relative h-20 sm:h-24 rounded-md overflow-hidden border bg-[#FFFFFF] p-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]',
                isActive
                  ? 'border-[#8B5A2B] ring-1 ring-[#8B5A2B] shadow-2xs'
                  : 'border-[#D4AF37]/30 hover:border-[#8B5A2B] opacity-80 hover:opacity-100'
              )}
            >
              <img
                src={getProductImageUrl(img)}
                alt={img.alt || 'Thumbnail'}
                className="w-full h-full object-cover object-center rounded-xs"
              />
            </button>
          );
        })}
      </div>

      {/* Shilpa Shastra Proportions Banner */}
      <div className="p-4 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/25 flex items-center justify-between text-xs text-[#5C5248] font-serif shadow-2xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#8B5A2B] shrink-0" />
          <div>
            <span className="font-bold text-[#3A2D20] block">
              Shilpa Shastra Proportions
            </span>
            <span className="text-[11px] text-[#5C5248]">
              Validated by Varanasi Veda Sthapathis according to sacred iconometry.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#8B5A2B] font-bold text-[11px] uppercase tracking-wider shrink-0">
          <span>CERTIFICATE {certificateNumber}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
