import React, { useState } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export interface NewProductPayload {
  name: string;
  deity: string;
  sku: string;
  basePrice: number;
  originalPrice?: number;
  material: string;
  dimensions: string;
  stockCount: number;
  shortDescription: string;
  longDescription: string;
  imageSrc: string;
  status: 'In Stock' | 'Low Stock' | 'Mandir Reserved';
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (payload: NewProductPayload) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
}) => {
  const [name, setName] = useState('');
  const [deity, setDeity] = useState('Shri Krishna');
  const [sku, setSku] = useState('SRA-KR-35');
  const [basePrice, setBasePrice] = useState<number | ''>(18500);
  const [originalPrice, setOriginalPrice] = useState<number | ''>(22000);
  const [material, setMaterial] = useState('Chemical Resin (White Stone Finish)');
  const [dimensions, setDimensions] = useState('12-inch • 6.5 kg');
  const [stockCount, setStockCount] = useState<number | ''>(5);
  const [shortDescription, setShortDescription] = useState(
    'Handcrafted Vigraha sculptured with fine sacred details according to Shilpa Shastras.'
  );
  const [longDescription, setLongDescription] = useState(
    'Masterfully cast in high-density chemical resin composite, hand-painted with durable gold leaf trim and weather-resistant finish.'
  );
  const [imageSrc, setImageSrc] = useState('/static/idols/swarna-vastra-kamadhenu-krishna.png');
  const [status, setStatus] = useState<'In Stock' | 'Low Stock' | 'Mandir Reserved'>('In Stock');

  if (!isOpen) return null;

  // Auto update SKU preview based on deity
  const handleDeityChange = (selected: string) => {
    setDeity(selected);
    const prefixMap: Record<string, string> = {
      'Shri Krishna': 'SRA-KR',
      'Radha Krishna': 'SRA-RK',
      'Gautam Buddha': 'SRA-BD',
      'Shiv Parivar': 'SRA-SP',
      'Shri Ganesha': 'SRA-GN',
      'Durga & Hanuman': 'SRA-[#]',
      'Lord Ram': 'SRA-RM',
      'Lord Hanuman': 'SRA-HN',
    };
    const pfx = prefixMap[selected] || 'SRA-ID';
    const randomNum = Math.floor(30 + Math.random() * 60);
    setSku(`${pfx}-${randomNum}`);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageSrc(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (!basePrice || Number(basePrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    onSaveProduct({
      name,
      deity,
      sku,
      basePrice: Number(basePrice),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      material,
      dimensions,
      stockCount: stockCount !== '' ? Number(stockCount) : 1,
      shortDescription,
      longDescription,
      imageSrc: imageSrc || '/static/idols/swarna-vastra-kamadhenu-krishna.png',
      status,
    });

    // Reset form
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FAF9F6] rounded-xl border border-[#D4AF37]/40 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#F5F2ED] border-b border-[#D4AF37]/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center font-serif text-sm font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.2em] text-[#8B5A2B] uppercase font-serif font-bold block">
                JALANDHAR ATELIER INVENTORY INTAKE
              </span>
              <h2 className="font-serif text-xl font-bold text-[#3A2D20]">
                Add New Handcrafted Murti / Idol
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 1. Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Idol / Murti Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pure White Marble Ganesha Idol"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Deity Category *
              </label>
              <select
                value={deity}
                onChange={(e) => handleDeityChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20] font-serif"
              >
                <option value="Shri Krishna">Shri Krishna</option>
                <option value="Radha Krishna">Radha Krishna</option>
                <option value="Gautam Buddha">Gautam Buddha</option>
                <option value="Shiv Parivar">Shiv Parivar</option>
                <option value="Shri Ganesha">Shri Ganesha</option>
                <option value="Durga & Hanuman">Durga & Hanuman</option>
                <option value="Lord Ram">Lord Ram</option>
                <option value="Lord Hanuman">Lord Hanuman</option>
              </select>
            </div>
          </div>

          {/* 2. SKU & Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                SKU Identifier
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none font-mono text-[#8B5A2B] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Offering Price (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="18500"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Original MRP (₹)
              </label>
              <input
                type="number"
                placeholder="22000"
                value={originalPrice}
                onChange={(e) =>
                  setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#8C8276]"
              />
            </div>
          </div>

          {/* 3. Material & Dimensions & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Material & Finish
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Chemical Resin (White Stone Finish)"
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Height & Weight
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 12-inch • 6.5 kg"
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Initial Stock (pcs)
              </label>
              <input
                type="number"
                value={stockCount}
                onChange={(e) =>
                  setStockCount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20] font-bold"
              />
            </div>
          </div>

          {/* 4. Image Upload & Preview */}
          <div className="p-4 rounded-lg bg-[#F5F2ED] border border-[#D4AF37]/25 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20]">
                Idol Image Upload / Preview
              </label>
              <span className="text-[10px] text-[#8C8276]">Supports PNG, JPG, WebP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-8 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 rounded-sm bg-[#8B5A2B] hover:bg-[#724923] text-white text-xs font-serif cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-[#8C8276] font-serif">or enter URL below</span>
                </div>

                <input
                  type="text"
                  placeholder="Or paste image URL (e.g. /static/idols/my-idol.png)"
                  value={imageSrc}
                  onChange={(e) => setImageSrc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20]"
                />
              </div>

              {/* Live Image Preview Frame */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-2 rounded-md bg-white border border-[#D4AF37]/30 h-28">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="New idol preview"
                    className="h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-[#8C8276]">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px]">No image selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. Short & Long Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#3A2D20] mb-1">
                Detailed Craftsmanship & Consecration Description
              </label>
              <textarea
                rows={3}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D4AF37]/30 rounded-sm focus:border-[#8B5A2B] focus:outline-none text-[#3A2D20]"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-[#D4AF37]/25 flex items-center justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" type="submit" className="font-serif uppercase tracking-wider">
              <Check className="w-4 h-4 mr-1.5" />
              <span>Publish Idol to Catalog</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
