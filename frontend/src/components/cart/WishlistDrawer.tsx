import React from 'react';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
}

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
  onRemoveItem: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onAddToCart,
}) => {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="My Wishlist"
      subtitle={`${items.length} saved item${items.length === 1 ? '' : 's'}`}
    >
      {items.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FFFDF5] border border-[#D4AF37]/30 text-[#8B5A2B] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#3A2D20]">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-[#5C5248] max-w-xs mx-auto">
            Save murtis you love by clicking the heart icon on any product.
          </p>
          <Button variant="secondary" size="sm" onClick={onClose} className="font-serif">
            Browse Collection
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-md bg-[#FFFDF5] border border-[#D4AF37]/25 flex gap-3"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-24 object-cover rounded-xs border border-[#D4AF37]/30 bg-[#F5F2ED] shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between text-xs font-serif">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-[#3A2D20] leading-snug">{item.name}</h4>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-[#8C8276] hover:text-[#A34D3D] transition-colors p-0.5 shrink-0"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#D4AF37]/20">
                  <span className="font-bold text-sm text-[#8B5A2B]">
                    {formatCurrency(item.price)}
                  </span>
                  <button
                    onClick={() => { onAddToCart(item); onClose(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8B5A2B] hover:bg-[#724923] text-white text-[11px] font-serif rounded-xs transition-colors"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
};
