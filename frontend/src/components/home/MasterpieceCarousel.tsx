import React, { useState, useEffect } from 'react';
import { Star, Heart, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { getLiveProductsPaginated, getProductImageUrl } from '../../data/products';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Product } from '../../types';

interface MasterpieceCarouselProps {
  products?: Product[];
  onSelectProduct: (slug: string) => void;
}

export const MasterpieceCarousel: React.FC<MasterpieceCarouselProps> = ({
  products: initialProducts,
  onSelectProduct,
}) => {
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      const filtered = initialProducts.filter((p) => p.isFeaturedMasterpiece || p.featuredOrder);
      setFeatured(filtered.length > 0 ? filtered : initialProducts.slice(0, 4));
      setLoading(false);
    } else {
      const loadFeatured = async () => {
        try {
          const res = await getLiveProductsPaginated({ featured_only: true });
          if (res.items && res.items.length > 0) {
            setFeatured(res.items);
          } else {
            const fallbackRes = await getLiveProductsPaginated({ limit: 4 });
            setFeatured(fallbackRes.items || []);
          }
        } catch (err) {
          console.error("Failed to load masterpieces:", err);
        } finally {
          setLoading(false);
        }
      };
      loadFeatured();
    }
  }, [initialProducts]);

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWishlisted((prev) => ({ ...prev, [id]: !prev[id] }));
  };


  return (
    <section className="py-20 bg-[#F5F2ED] border-t border-b border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Carousel Navigation */}
        <div className="flex items-end justify-between pb-8 border-b border-[#D4AF37]/20">
          <div>
            <span className="text-[11px] tracking-[0.25em] text-[#8B5A2B] uppercase font-serif font-bold block mb-1">
              HAND-CARVED HIGHLIGHTS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A2D20]">
              The Sanctum Masterpiece Selection
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Previous masterpieces"
              className="w-10 h-10 rounded-full border border-[#D4AF37]/30 bg-[#FFFDF5] text-[#5C5248] hover:bg-white hover:text-[#8B5A2B] hover:border-[#8B5A2B] flex items-center justify-center transition-colors focus:outline-none shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              aria-label="Next masterpieces"
              className="w-10 h-10 rounded-full border border-[#D4AF37]/30 bg-[#FFFDF5] text-[#5C5248] hover:bg-white hover:text-[#8B5A2B] hover:border-[#8B5A2B] flex items-center justify-center transition-colors focus:outline-none shadow-2xs"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && featured.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#FFFDF5] border border-[#D4AF37]/20 rounded-md h-96 p-4 flex flex-col justify-between">
                <div className="h-56 bg-[#EAE4DC] rounded-sm w-full" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-[#EAE4DC] rounded-xs w-3/4" />
                  <div className="h-3 bg-[#EAE4DC] rounded-xs w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Masterpiece Cards Grid */}
        {(!loading || featured.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            {featured.map((product) => {
              const isFav = wishlisted[product.id];
              const imageSrc = getProductImageUrl(product.images?.[0]) || '/static/idols/swarna-vastra-kamadhenu-krishna.png';
              const sizeLabel = product.specifications?.heightWidth || product.specifications?.Weight || 'Handcrafted Sanctum Scale';

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product.slug)}
                  className="group bg-[#FFFDF5] border border-[#D4AF37]/25 rounded-md overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Image Container with Badges */}
                  <div className="relative h-72 w-full bg-[#FAF9F6] overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Top Pill Tag */}
                    <div className="absolute top-3 left-3 bg-[#FFFDF5]/90 backdrop-blur-xs px-2.5 py-1 rounded-xs border border-[#D4AF37]/30 text-[10px] font-serif uppercase tracking-widest text-[#8B5A2B] font-semibold">
                      {product.material ? product.material.split('/')[0] : 'Handcrafted Resin'}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(e, product.id)}
                      aria-label={`Wishlist ${product.name}`}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFFDF5]/90 backdrop-blur-xs border border-[#D4AF37]/30 flex items-center justify-center text-[#5C5248] hover:text-[#A34D3D] transition-colors focus:outline-none"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'fill-[#A34D3D] text-[#A34D3D]' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Star Rating */}
                      <div className="flex items-center gap-1.5 text-xs text-[#5C5248]">
                        <div className="flex items-center text-[#D4AF37]">
                          <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
                        </div>
                        <span className="font-semibold text-[#3A2D20]">{(product.rating || 5.0).toFixed(1)}</span>
                        <span>({product.reviewCount || 0} Reviews)</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-lg font-bold text-[#3A2D20] group-hover:text-[#8B5A2B] transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#5C5248] line-clamp-1">
                        {sizeLabel} {product.deityForm ? `• ${product.deityForm}` : ''}
                      </p>
                    </div>

                    {/* Price & View Button */}
                    <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8177] block font-serif">
                        Pratishtha Offering
                      </span>
                      <span className="font-serif text-lg font-bold text-[#8B5A2B]">
                        {formatCurrency(product.basePrice)}
                      </span>
                    </div>

                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => onSelectProduct(product.slug)}
                      className="font-serif tracking-wider text-xs px-3"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
};
