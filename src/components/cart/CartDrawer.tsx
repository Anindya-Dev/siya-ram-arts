import React from 'react';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { Trash2, CheckCircle, ShoppingBag, Minus, Plus } from 'lucide-react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  material: string;
  ornamentation: string;
  unitPrice: number;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Your Bag"
      subtitle={`${items.length} item${items.length === 1 ? '' : 's'}`}
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="space-y-1.5 text-xs text-[#5C5248] font-serif">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#8B5A2B] text-sm">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Packaging &amp; Insurance</span>
                <span className="text-[#8B5A2B] font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Blessing &amp; Ritual Certificate</span>
                <span className="text-[#8B5A2B] font-semibold">Included</span>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              fullWidth
              onClick={onCheckout}
              className="font-serif uppercase tracking-wider font-bold text-sm shadow-md"
            >
              Proceed to Checkout ({formatCurrency(subtotal)})
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FFFDF5] border border-[#D4AF37]/30 text-[#8B5A2B] flex items-center justify-center mx-auto shadow-2xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#3A2D20]">
            Your Bag is Empty
          </h3>
          <p className="text-xs text-[#5C5248] max-w-xs mx-auto">
            Explore our collection of handcrafted murtis made by master artisans in Jaipur.
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
              className="p-3.5 rounded-md bg-[#FFFDF5] border border-[#D4AF37]/25 flex gap-3 shadow-2xs"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-24 object-cover rounded-xs border border-[#D4AF37]/30 bg-[#F5F2ED] shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between text-xs font-serif">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[#3A2D20] line-clamp-1">{item.name}</h4>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[#8C8276] hover:text-[#A34D3D] transition-colors p-0.5"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-[#5C5248] space-y-0.5 mt-0.5 font-sans">
                    <p>{item.size} • {item.material}</p>
                    <p className="text-[10px] text-[#A67C52] font-serif truncate">
                      {item.ornamentation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/20">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-[#D4AF37]/40 rounded-xs bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity <= 1) {
                          onRemoveItem(item.id);
                        } else {
                          onUpdateQuantity(item.id, item.quantity - 1);
                        }
                      }}
                      className="w-7 h-7 flex items-center justify-center text-[#5C5248] hover:bg-[#F5F2ED] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-0.5 font-bold font-sans text-[#3A2D20] text-xs min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-[#5C5248] hover:bg-[#F5F2ED] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-bold text-sm text-[#8B5A2B]">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Info note */}
          <div className="p-3 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/25 text-[11px] text-[#5C5248] space-y-1 font-serif">
            <div className="flex items-center gap-1.5 text-[#8B5A2B] font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Blessing Certificate Included</span>
            </div>
            <p>
              Each murti is individually blessed and packed in secure triple-cushioned packaging.
            </p>
          </div>
        </div>
      )}
    </Sheet>
  );
};
