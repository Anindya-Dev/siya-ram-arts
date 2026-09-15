import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  Star,
  Layers,
  Scroll,
  HeartHandshake,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Product, ProductVariant } from '../../types';
import { uploadImage } from '../../lib/api';

export interface LocationOption {
  id: string;
  code: string;
  name: string;
}

export interface NewProductPayload {
  name: string;
  slug?: string;
  deity: string;
  deityForm?: string;
  sku: string;
  basePrice: number;
  originalPrice?: number;
  discountBadge?: string;
  material: string;
  materialPurity?: string;
  atelier?: string;
  shortDescription?: string;
  longDescription?: string;
  certificateNumber?: string;
  isFeaturedMasterpiece?: boolean;
  featuredOrder?: number;
  tags?: string[];
  specifications: Record<string, any>;
  sevaGuidelines: Record<string, string>;
  images: {
    url: string;
    alt: string;
    isPrimary: boolean;
    fileId?: string;
  }[];
  variants: {
    id?: string;
    size: string;
    material: string;
    finish: string;
    basePrice: number;
    priceDelta: number;
    sku: string;
    isActive: boolean;
    stock?: Record<string, number>;
  }[];
  carverQuote?: {
    quote: string;
    artisanName: string;
    artisanTitle: string;
  } | null;
}

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  locations?: LocationOption[];
  onSaveProduct: (payload: NewProductPayload, isEdit: boolean, productId?: string) => Promise<void>;
  token?: string | null;
}

interface ImageDraft {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  fileId?: string;
  file?: File | null;
  previewUrl?: string;
}

interface VariantDraft {
  id?: string;
  size: string;
  material: string;
  finish: string;
  basePrice: number;
  priceDelta: number;
  sku: string;
  isActive: boolean;
  stock: Record<string, number>;
}

const SPEC_KEYS: { key: string; label: string; placeholder: string }[] = [
  { key: 'canonicalForm', label: 'Canonical Form', placeholder: 'e.g. Kamadhenu Krishna playing Bansuri on Lotus' },
  { key: 'primaryMedium', label: 'Primary Medium', placeholder: 'e.g. Chemical Resin (Cast Composite)' },
  { key: 'ornamentationGrade', label: 'Ornamentation Grade', placeholder: 'e.g. 24K Gold Leaf Vark & Enamel' },
  { key: 'mudrasAttributes', label: 'Mudras & Attributes', placeholder: 'e.g. Abhaya Mudra, Varada Mudra, Sudarshana Chakra' },
  { key: 'pedestalFoundation', label: 'Pedestal & Foundation', placeholder: 'e.g. Double-tiered Hand-carved Lotus Base' },
  { key: 'archComposition', label: 'Arch & Prabhavali', placeholder: 'e.g. Ornate Peacock & Floral Halo Prabhavali' },
  { key: 'authenticationSeal', label: 'Authentication Seal', placeholder: 'e.g. SRA-CERT-2026-KR01' },
  { key: 'netWeight', label: 'Net Weight', placeholder: 'e.g. 11.2 kg' },
  { key: 'heightWidth', label: 'Height & Dimensions', placeholder: 'e.g. 24-inch height, 14-inch width' },
  { key: 'provenance', label: 'Provenance Atelier', placeholder: 'e.g. Jaipur Artisan Atelier, Rajasthan' },
  { key: 'pratishthaStatus', label: 'Pratishtha Consecration Status', placeholder: 'e.g. Pratishtha-ready (Cleanse with Gangajal)' },
  { key: 'craftsmanshipTime', label: 'Craftsmanship Time', placeholder: 'e.g. 28 Days of Hand-carving and Gilding' },
];

const SEVA_KEYS: { key: string; label: string; placeholder: string }[] = [
  { key: 'panchamritAbhishek', label: 'Panchamrit Abhishek', placeholder: 'Permitted with gentle milk & honey; rinse immediately with pure water.' },
  { key: 'goldFoilCare', label: '24K Gold Foil / Vark Care', placeholder: 'Dust strictly with ultra-soft dry camel hair or microfiber brush.' },
  { key: 'chandanKumkum', label: 'Chandan & Kumkum Application', placeholder: 'Apply natural chandan paste; avoid acid-treated sindoor on gold.' },
  { key: 'transitInstallation', label: 'Transit & Sanctum Placement', placeholder: 'Place upon level sanctum pedestal cushioned with pure silk cloth.' },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  locations = [],
  onSaveProduct,
  token,
}) => {
  const isEdit = Boolean(productToEdit);
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'seva' | 'variants' | 'images' | 'artisan'>('basic');

  // Basic Info State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [deity, setDeity] = useState('Shri Krishna');
  const [deityForm, setDeityForm] = useState('');
  const [material, setMaterial] = useState('Chemical Resin');
  const [materialPurity, setMaterialPurity] = useState('Cast Composite');
  const [basePrice, setBasePrice] = useState<number | ''>(25000);
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [discountBadge, setDiscountBadge] = useState('');
  const [sku, setSku] = useState('SRA-KR-01');
  const [atelier, setAtelier] = useState('Jaipur Atelier');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [tagsString, setTagsString] = useState('Handcrafted, Jaipur Atelier, Sacred Murti');
  const [isFeaturedMasterpiece, setIsFeaturedMasterpiece] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<number | ''>('');

  // Specifications (12 keys)
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  // Seva Guidelines (4 keys)
  const [sevaGuidelines, setSevaGuidelines] = useState<Record<string, string>>({});

  // Variants
  const [variants, setVariants] = useState<VariantDraft[]>([]);

  // Images
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState('');

  // Carver Quote
  const [carverQuote, setCarverQuote] = useState({
    quote: '',
    artisanName: '',
    artisanTitle: '',
  });

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize or reset form when modal opens or productToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setUploadProgressText(null);

    if (productToEdit) {
      setName(productToEdit.name || '');
      setSlug(productToEdit.slug || '');
      setDeity(productToEdit.deity || 'Shri Krishna');
      setDeityForm(productToEdit.deityForm || '');
      setMaterial(productToEdit.material || 'Chemical Resin');
      setMaterialPurity(productToEdit.materialPurity || 'Cast Composite');
      setBasePrice(productToEdit.basePrice || 0);
      setOriginalPrice(productToEdit.originalPrice ?? '');
      setDiscountBadge(productToEdit.discountBadge || '');
      setSku(productToEdit.sku || '');
      setAtelier(productToEdit.atelier || 'Jaipur Atelier');
      setShortDescription(productToEdit.shortDescription || '');
      setLongDescription(productToEdit.longDescription || '');
      setCertificateNumber(productToEdit.certificateNumber || '');
      setTagsString((productToEdit.tags || []).join(', '));
      setIsFeaturedMasterpiece(Boolean(productToEdit.isFeaturedMasterpiece));
      setFeaturedOrder(productToEdit.featuredOrder ?? '');

      // Specs
      const currentSpecs: Record<string, string> = {};
      SPEC_KEYS.forEach(({ key }) => {
        currentSpecs[key] = (productToEdit.specifications as any)?.[key] || '';
      });
      setSpecifications(currentSpecs);

      // Seva
      const currentSeva: Record<string, string> = {};
      SEVA_KEYS.forEach(({ key }) => {
        currentSeva[key] = (productToEdit.sevaGuidelines as any)?.[key] || '';
      });
      setSevaGuidelines(currentSeva);

      // Variants
      if (productToEdit.variants && productToEdit.variants.length > 0) {
        setVariants(
          productToEdit.variants.map((v) => ({
            id: v.id,
            size: v.size,
            material: v.material,
            finish: v.finish,
            basePrice: v.basePrice,
            priceDelta: v.priceDelta,
            sku: v.sku,
            isActive: v.isActive,
            stock: {},
          }))
        );
      } else {
        setVariants([
          {
            size: '18-inch',
            material: productToEdit.material || 'Chemical Resin',
            finish: 'Polished White Finish',
            basePrice: productToEdit.basePrice || 25000,
            priceDelta: 0,
            sku: `${productToEdit.sku || 'SRA'}-1`,
            isActive: true,
            stock: {},
          },
        ]);
      }

      // Images
      if (productToEdit.images && productToEdit.images.length > 0) {
        setImages(
          productToEdit.images.map((img, idx) => ({
            id: `existing-${idx}-${Date.now()}`,
            url: img.url,
            alt: img.alt || productToEdit.name,
            isPrimary: Boolean(img.isPrimary),
            fileId: img.fileId,
          }))
        );
      } else {
        setImages([]);
      }

      // Carver Quote
      if (productToEdit.carverQuote) {
        setCarverQuote({
          quote: productToEdit.carverQuote.quote || '',
          artisanName: productToEdit.carverQuote.artisanName || '',
          artisanTitle: productToEdit.carverQuote.artisanTitle || '',
        });
      } else {
        setCarverQuote({ quote: '', artisanName: '', artisanTitle: '' });
      }
    } else {
      // New Product Defaults
      const randomNum = Math.floor(30 + Math.random() * 60);
      setName('');
      setSlug('');
      setDeity('Shri Krishna');
      setDeityForm('Kamadhenu Krishna');
      setMaterial('Chemical Resin');
      setMaterialPurity('Cast Composite');
      setBasePrice(28000);
      setOriginalPrice(32000);
      setDiscountBadge('Inaugural Blessing');
      setSku(`SRA-KR-${randomNum}`);
      setAtelier('Jaipur Atelier');
      setShortDescription('Handcrafted Vigraha sculpted with sacred precision per Shilpa Shastra canons.');
      setLongDescription('Masterfully cast in high-density chemical resin composite, hand-painted with durable gold leaf trim and consecration-ready finish.');
      setCertificateNumber(`SRA-CERT-2026-${randomNum}`);
      setTagsString('Handcrafted, Jaipur Atelier, Krishna, Sacred Murti');
      setIsFeaturedMasterpiece(false);
      setFeaturedOrder('');

      // Default specs
      const initSpecs: Record<string, string> = {
        canonicalForm: 'Kamadhenu Krishna playing Bansuri on Lotus Base',
        primaryMedium: 'Chemical Resin (Cast Composite)',
        ornamentationGrade: '24K Gold Leaf Vark & Enamel',
        mudrasAttributes: 'Bansuri (Flute), Peacok Feather, Triple-bend Tribhanga Pose',
        pedestalFoundation: 'Hand-carved Lotus Base',
        archComposition: 'Aura of Kamadhenu under Sacred Kadamba Tree',
        authenticationSeal: `SRA-CERT-2026-${randomNum}`,
        netWeight: '8.5 kg',
        heightWidth: '18-inch height, 10-inch width',
        provenance: 'Jaipur Artisan Atelier, Rajasthan',
        pratishthaStatus: 'Pratishtha-ready (Cleanse with Gangajal)',
        craftsmanshipTime: '24 Days of artisan sculpting & gilding',
      };
      setSpecifications(initSpecs);

      // Default seva
      const initSeva: Record<string, string> = {
        panchamritAbhishek: 'Permitted with pure milk and honey; wipe gently with microfiber cloth immediately.',
        goldFoilCare: 'Dust strictly with ultra-soft camel hair brush. Avoid moisture on gold foil accents.',
        chandanKumkum: 'Use pure natural chandan paste; avoid chemical sindoor directly on gilded surfaces.',
        transitInstallation: 'Handle with clean sacred cloth. Place upon a level sanctum pedestal.',
      };
      setSevaGuidelines(initSeva);

      // Default variant
      const defaultStock: Record<string, number> = {};
      if (locations.length > 0) {
        defaultStock[locations[0].code] = 3;
      } else {
        defaultStock['JPR'] = 3;
      }

      setVariants([
        {
          size: '18-inch',
          material: 'Chemical Resin',
          finish: '24K Gold Foil & Polished Finish',
          basePrice: 28000,
          priceDelta: 0,
          sku: `SRA-KR-${randomNum}-18`,
          isActive: true,
          stock: defaultStock,
        },
      ]);

      setImages([]);
      setCarverQuote({
        quote: 'Every stroke of the chisel is an offering of devotion to the divine presence.',
        artisanName: 'Master Sculptor Rajesh Sharma',
        artisanTitle: 'Chief Artisan, Jaipur Atelier',
      });
    }

    setActiveTab('basic');
  }, [isOpen, productToEdit, locations]);

  // Clean up Object URLs on unmount or modal close
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [images]);

  if (!isOpen) return null;

  // Auto generate slug from name if not editing or if empty
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit || !slug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  // Image upload handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDrafts: ImageDraft[] = Array.from(files).map((file: File, idx: number) => {
      const previewUrl = URL.createObjectURL(file);
      return {
        id: `upload-${Date.now()}-${idx}`,
        url: '',
        alt: name ? `${name} - Photo ${images.length + idx + 1}` : file.name,
        isPrimary: images.length === 0 && idx === 0,
        file,
        previewUrl,
      };
    });

    setImages((prev) => [...prev, ...newDrafts]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddManualUrl = () => {
    if (!manualImageUrl.trim()) return;
    const newDraft: ImageDraft = {
      id: `manual-${Date.now()}`,
      url: manualImageUrl.trim(),
      alt: name ? `${name} - Image` : 'Murti Image',
      isPrimary: images.length === 0,
    };
    setImages((prev) => [...prev, newDraft]);
    setManualImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const updated = prev.filter((_, i) => i !== index);
      if (target?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Variant Add / Remove / Change
  const handleAddVariant = () => {
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const newVar: VariantDraft = {
      size: '24-inch',
      material: material || 'Chemical Resin',
      finish: '24K Gold Foil Accent',
      basePrice: Number(basePrice) || 35000,
      priceDelta: 5000,
      sku: `${sku || 'SRA'}-${randomSuffix}`,
      isActive: true,
      stock: {},
    };
    setVariants((prev) => [...prev, newVar]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('A product must have at least one variant.');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantDraft, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleVariantStockChange = (variantIdx: number, locCode: string, qty: number) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIdx) return v;
        const updatedStock = { ...v.stock, [locCode]: Math.max(0, qty) };
        return { ...v, stock: updatedStock };
      })
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setActiveTab('basic');
      setErrorMessage('Masterpiece name is required.');
      return;
    }
    if (!slug.trim()) {
      setActiveTab('basic');
      setErrorMessage('A unique URL slug is required.');
      return;
    }
    if (!sku.trim()) {
      setActiveTab('basic');
      setErrorMessage('Masterpiece SKU is required.');
      return;
    }
    if (!basePrice || Number(basePrice) <= 0) {
      setActiveTab('basic');
      setErrorMessage('Please specify a valid base price.');
      return;
    }
    if (variants.length === 0) {
      setActiveTab('variants');
      setErrorMessage('At least one variant must be defined.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload any newly selected images to ImageKit
      const uploadedImages: { url: string; alt: string; isPrimary: boolean; fileId?: string }[] = [];
      const pendingUploads = images.filter((img) => img.file);

      if (pendingUploads.length > 0) {
        setUploadProgressText(`Uploading ${pendingUploads.length} images to ImageKit...`);
      }

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        if (item.file) {
          setUploadProgressText(`Uploading image ${i + 1} of ${images.length} to ImageKit...`);
          const uploadRes = await uploadImage(item.file, token);
          uploadedImages.push({
            url: uploadRes.url,
            alt: item.alt || name,
            isPrimary: item.isPrimary,
            fileId: uploadRes.fileId,
          });
        } else if (item.url) {
          uploadedImages.push({
            url: item.url,
            alt: item.alt || name,
            isPrimary: item.isPrimary,
            fileId: item.fileId,
          });
        }
      }

      // Ensure at least one primary image if images exist
      if (uploadedImages.length > 0 && !uploadedImages.some((img) => img.isPrimary)) {
        uploadedImages[0].isPrimary = true;
      }

      setUploadProgressText('Persisting idol catalog records...');

      // Prepare payload
      const tags = tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: NewProductPayload = {
        name: name.trim(),
        slug: slug.trim(),
        deity: deity.trim(),
        deityForm: deityForm.trim() || deity.trim(),
        material: material.trim(),
        materialPurity: materialPurity.trim(),
        basePrice: Number(basePrice),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        discountBadge: discountBadge.trim() || undefined,
        sku: sku.trim(),
        atelier: atelier.trim() || 'Jaipur Atelier',
        shortDescription: shortDescription.trim(),
        longDescription: longDescription.trim(),
        certificateNumber: certificateNumber.trim(),
        isFeaturedMasterpiece,
        featuredOrder: featuredOrder !== '' ? Number(featuredOrder) : undefined,
        tags,
        specifications,
        sevaGuidelines,
        images: uploadedImages,
        variants: variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          size: v.size,
          material: v.material,
          finish: v.finish,
          basePrice: Number(v.basePrice),
          priceDelta: Number(v.priceDelta || 0),
          sku: v.sku,
          isActive: v.isActive,
          ...(v.stock ? { stock: v.stock } : {}),
        })),
        carverQuote: carverQuote.quote.trim()
          ? {
              quote: carverQuote.quote.trim(),
              artisanName: carverQuote.artisanName.trim() || 'Master Sculptor',
              artisanTitle: carverQuote.artisanTitle.trim() || 'Jaipur Atelier Artisan',
            }
          : null,
      };

      await onSaveProduct(payload, isEdit, productToEdit?.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
      setUploadProgressText(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-[#FFFDF5] border border-[#D4AF37]/40 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#F5F2ED] border-b border-[#D4AF37]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#8B5A2B]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B5A2B]">
              <Sparkles className="w-5 h-5 text-[#8B5A2B]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#3A2D20] flex items-center gap-2">
                {isEdit ? 'Edit Sacred Masterpiece' : 'Publish New Sacred Idol'}
                <span className="text-xs font-sans font-normal px-2 py-0.5 rounded-full bg-[#8B5A2B]/10 text-[#8B5A2B] border border-[#8B5A2B]/20">
                  {isEdit ? `ID: ${productToEdit?.sku}` : 'ImageKit Lifecycle'}
                </span>
              </h2>
              <p className="text-xs text-[#8C8276] font-serif">
                Manage full spiritual specifications, initial stock per atelier, and ImageKit assets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-[#8C8276] hover:text-[#3A2D20] hover:bg-[#D4AF37]/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#D4AF37]/20 bg-[#F5F2ED]/60 overflow-x-auto text-xs font-serif font-semibold shrink-0">
          {[
            { id: 'basic', label: '1. Sacred Identity', icon: Star },
            { id: 'specs', label: '2. Specifications', icon: Scroll },
            { id: 'seva', label: '3. Seva Guidelines', icon: HeartHandshake },
            { id: 'variants', label: '4. Variants & Stock', icon: Layers },
            { id: 'images', label: '5. ImageKit Gallery', icon: ImageIcon },
            { id: 'artisan', label: '6. Artisan Blessing', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#8B5A2B] text-[#8B5A2B] bg-[#FFFDF5] font-bold shadow-2xs'
                    : 'border-transparent text-[#8C8276] hover:text-[#3A2D20] hover:bg-[#F5F2ED]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-[#A34D3D]/10 border border-[#A34D3D]/30 rounded-md text-[#A34D3D] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Masterpiece Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Swarna Vastra Kamadhenu Krishna"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="swarna-vastra-kamadhenu-krishna"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Deity Classification *
                  </label>
                  <select
                    value={deity}
                    onChange={(e) => setDeity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  >
                    <option value="Shri Krishna">Shri Krishna</option>
                    <option value="Radha Krishna">Radha Krishna</option>
                    <option value="Lord Ram">Lord Ram / Ram Lalla</option>
                    <option value="Shiv Parivar">Shiv Parivar</option>
                    <option value="Shri Ganesha">Shri Ganesha</option>
                    <option value="Lord Hanuman">Lord Hanuman</option>
                    <option value="Gautam Buddha">Gautam Buddha</option>
                    <option value="Maa Durga">Maa Durga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Specific Deity Form
                  </label>
                  <input
                    type="text"
                    value={deityForm}
                    onChange={(e) => setDeityForm(e.target.value)}
                    placeholder="e.g. Kamadhenu Krishna • Gopala"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Primary Material *
                  </label>
                  <input
                    type="text"
                    required
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Chemical Resin"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Material Purity / Finish Grade
                  </label>
                  <input
                    type="text"
                    value={materialPurity}
                    onChange={(e) => setMaterialPurity(e.target.value)}
                    placeholder="High-Density Cast Composite"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Base Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Original Strike Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Optional original price"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Discount / Holy Badge
                  </label>
                  <input
                    type="text"
                    value={discountBadge}
                    onChange={(e) => setDiscountBadge(e.target.value)}
                    placeholder="e.g. Inaugural Blessing, 15% Off"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Product Master SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SRA-KR-01"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Atelier of Origin
                  </label>
                  <input
                    type="text"
                    value={atelier}
                    onChange={(e) => setAtelier(e.target.value)}
                    placeholder="Jaipur Atelier"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Authentication Certificate No.
                  </label>
                  <input
                    type="text"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    placeholder="SRA-CERT-2026-001"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="Handcrafted, Jaipur Atelier, Sacred Murti"
                  className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                  Short Description (Catalog Summary)
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                  Long Theological Description
                </label>
                <textarea
                  rows={4}
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                />
              </div>

              {/* Masterpiece flags */}
              <div className="flex items-center gap-6 p-3 bg-[#F5F2ED] rounded-lg border border-[#D4AF37]/20">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-serif font-bold text-[#3A2D20]">
                  <input
                    type="checkbox"
                    checked={isFeaturedMasterpiece}
                    onChange={(e) => setIsFeaturedMasterpiece(e.target.checked)}
                    className="rounded-sm border-[#D4AF37] text-[#8B5A2B] focus:ring-[#8B5A2B]"
                  />
                  <span>Feature as Masterpiece on Homepage Carousel</span>
                </label>

                {isFeaturedMasterpiece && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5C5248] font-serif">Order:</span>
                    <input
                      type="number"
                      min="1"
                      value={featuredOrder}
                      onChange={(e) => setFeaturedOrder(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1"
                      className="w-20 px-2 py-1 bg-white border border-[#D4AF37]/30 rounded-md text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS (12 KEYS) */}
          {activeTab === 'specs' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-[#F5F2ED] rounded-lg border border-[#D4AF37]/20 text-xs text-[#5C5248] font-serif">
                The 12 canonical specification parameters ensure museum-grade documentation for collectors and devotees.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SPEC_KEYS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={specifications[key] || ''}
                      onChange={(e) =>
                        setSpecifications((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      placeholder={placeholder}
                      className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SEVA GUIDELINES */}
          {activeTab === 'seva' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-[#F5F2ED] rounded-lg border border-[#D4AF37]/20 text-xs text-[#5C5248] font-serif">
                Prescribe authentic daily worship (seva) and ritual cleansing directives specific to the idol medium and gold ornamentation.
              </div>

              <div className="space-y-4">
                {SEVA_KEYS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                      {label}
                    </label>
                    <textarea
                      rows={2}
                      value={sevaGuidelines[key] || ''}
                      onChange={(e) =>
                        setSevaGuidelines((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      placeholder={placeholder}
                      className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VARIANTS & INITIAL STOCK */}
          {activeTab === 'variants' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#5C5248] font-serif">
                  Define size and finish variants. When creating a product, set initial stock per atelier to create stock ledger entries.
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 rounded-sm bg-[#8B5A2B] hover:bg-[#6D4621] text-white font-serif text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Variant</span>
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((v, vIdx) => (
                  <div
                    key={v.id || `variant-${vIdx}`}
                    className="p-4 bg-white rounded-lg border border-[#D4AF37]/30 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/15">
                      <span className="text-xs font-serif font-bold text-[#8B5A2B]">
                        Variant #{vIdx + 1}: {v.size} ({v.sku})
                      </span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(vIdx)}
                          className="text-[#A34D3D] hover:text-red-700 text-xs font-serif flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-serif font-bold text-[#3A2D20] mb-0.5">
                          Size Dimension *
                        </label>
                        <input
                          type="text"
                          required
                          value={v.size}
                          onChange={(e) => handleVariantChange(vIdx, 'size', e.target.value)}
                          placeholder="e.g. 18-inch"
                          className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border border-[#D4AF37]/30 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-serif font-bold text-[#3A2D20] mb-0.5">
                          Material *
                        </label>
                        <input
                          type="text"
                          required
                          value={v.material}
                          onChange={(e) => handleVariantChange(vIdx, 'material', e.target.value)}
                          placeholder="Chemical Resin"
                          className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border border-[#D4AF37]/30 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-serif font-bold text-[#3A2D20] mb-0.5">
                          Finish *
                        </label>
                        <input
                          type="text"
                          required
                          value={v.finish}
                          onChange={(e) => handleVariantChange(vIdx, 'finish', e.target.value)}
                          placeholder="Polished White Finish"
                          className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border border-[#D4AF37]/30 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-serif font-bold text-[#3A2D20] mb-0.5">
                          Variant Base Price (₹) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={v.basePrice}
                          onChange={(e) =>
                            handleVariantChange(vIdx, 'basePrice', Number(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border border-[#D4AF37]/30 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-serif font-bold text-[#3A2D20] mb-0.5">
                          Price Delta (₹)
                        </label>
                        <input
                          type="number"
                          value={v.priceDelta}
                          onChange={(e) =>
                            handleVariantChange(vIdx, 'priceDelta', Number(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border border-[#D4AF37]/30 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-serif font-bold text-[#3A2D20] mb-0.5">
                          Variant SKU *
                        </label>
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => handleVariantChange(vIdx, 'sku', e.target.value)}
                          placeholder="SRA-KR-01-18"
                          className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border border-[#D4AF37]/30 rounded text-xs"
                        />
                      </div>
                    </div>

                    {/* Initial stock by location (only for new variants or product creation) */}
                    {(!isEdit || !v.id) && (
                      <div className="pt-2 border-t border-[#D4AF37]/10">
                        <label className="block text-[11px] font-serif font-bold text-[#5C5248] mb-1.5">
                          Initial Stock Quantity by Atelier Location:
                        </label>
                        <div className="flex flex-wrap gap-4">
                          {(locations.length > 0 ? locations : [{ id: '1', code: 'JPR', name: 'Jaipur Main Atelier' }, { id: '2', code: 'KSH', name: 'Kashi Sanctum Studio' }]).map((loc) => (
                            <div key={loc.code} className="flex items-center gap-2 bg-[#F5F2ED] px-3 py-1.5 rounded border border-[#D4AF37]/20">
                              <span className="text-xs font-serif text-[#3A2D20] font-bold">
                                {loc.code} ({loc.name.split(' ')[0]}):
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={v.stock[loc.code] ?? 0}
                                onChange={(e) =>
                                  handleVariantStockChange(vIdx, loc.code, Number(e.target.value))
                                }
                                className="w-16 px-2 py-0.5 bg-white border border-[#D4AF37]/30 rounded text-xs text-center font-mono font-bold"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: IMAGES & IMAGEKIT UPLOAD */}
          {activeTab === 'images' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-[#F5F2ED] rounded-lg border border-[#D4AF37]/20 text-xs text-[#5C5248] font-serif flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8B5A2B] shrink-0 mt-0.5" />
                <span>
                  Select high-resolution idol photography (JPEG, PNG, WebP). Images upload automatically to <strong>ImageKit</strong> with private credentials stored server-side. Mark one image as <strong>Primary</strong> for the catalog.
                </span>
              </div>

              {/* Upload trigger bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="admin-image-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-md bg-[#8B5A2B] hover:bg-[#6D4621] text-white font-serif text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Murti Image Files</span>
                </button>

                <div className="text-xs text-[#8C8276] font-serif text-center sm:text-left">
                  or enter static asset path:
                </div>

                <div className="flex-1 flex gap-2 w-full">
                  <input
                    type="text"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="/static/idols/swarna-vastra-kamadhenu-krishna.png"
                    className="flex-1 px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20]"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="px-3 py-2 bg-[#F5F2ED] hover:bg-[#D4AF37]/20 text-[#3A2D20] rounded-md border border-[#D4AF37]/30 text-xs font-serif font-bold"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Image preview grid */}
              {images.length === 0 ? (
                <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-lg p-8 text-center bg-[#FFFDF5]">
                  <ImageIcon className="w-10 h-10 text-[#D4AF37]/50 mx-auto mb-2" />
                  <p className="text-xs font-serif text-[#8C8276]">
                    No images added yet. Upload files to push to ImageKit upon save.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((img, idx) => {
                    const displaySrc = img.previewUrl || img.url;
                    return (
                      <div
                        key={img.id}
                        className={`relative group bg-white rounded-lg border overflow-hidden transition-all shadow-2xs ${
                          img.isPrimary
                            ? 'border-[#8B5A2B] ring-2 ring-[#8B5A2B]/20'
                            : 'border-[#D4AF37]/30'
                        }`}
                      >
                        <div className="aspect-square w-full bg-[#F5F2ED] flex items-center justify-center overflow-hidden">
                          <img
                            src={displaySrc}
                            alt={img.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Badges */}
                        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                          {img.isPrimary && (
                            <span className="px-2 py-0.5 bg-[#8B5A2B] text-white text-[10px] font-serif font-bold rounded-sm shadow-xs flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Primary
                            </span>
                          )}
                          {img.file && (
                            <span className="px-2 py-0.5 bg-[#D4AF37] text-[#3A2D20] text-[9px] font-mono font-bold rounded-sm shadow-xs">
                              ImageKit Pending
                            </span>
                          )}
                        </div>

                        {/* Actions overlay */}
                        <div className="p-2 bg-white border-t border-[#D4AF37]/15 flex items-center justify-between text-xs">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="text-[11px] text-[#8B5A2B] hover:underline font-serif font-bold"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="ml-auto text-[#A34D3D] hover:text-red-700 p-1"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ARTISAN BLESSING / CARVER QUOTE */}
          {activeTab === 'artisan' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-[#F5F2ED] rounded-lg border border-[#D4AF37]/20 text-xs text-[#5C5248] font-serif">
                Include an authentic quote from the master sculptor honoring the temple lineage and divine inspiration.
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                  Artisan Quote / Dedication
                </label>
                <textarea
                  rows={3}
                  value={carverQuote.quote}
                  onChange={(e) =>
                    setCarverQuote((prev) => ({ ...prev, quote: e.target.value }))
                  }
                  placeholder="e.g. When the chisel shapes the sacred crown, our fingers merely channel the grace of the divine sculptor."
                  className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Artisan Name
                  </label>
                  <input
                    type="text"
                    value={carverQuote.artisanName}
                    onChange={(e) =>
                      setCarverQuote((prev) => ({ ...prev, artisanName: e.target.value }))
                    }
                    placeholder="Master Sculptor Rajesh Sharma"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3A2D20] mb-1">
                    Artisan Title / Lineage
                  </label>
                  <input
                    type="text"
                    value={carverQuote.artisanTitle}
                    onChange={(e) =>
                      setCarverQuote((prev) => ({ ...prev, artisanTitle: e.target.value }))
                    }
                    placeholder="Chief Sculptor, Jaipur Murti Kala Lineage"
                    className="w-full px-3 py-2 bg-white border border-[#D4AF37]/30 rounded-md text-xs text-[#3A2D20] focus:outline-hidden focus:border-[#8B5A2B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-[#8C8276] font-serif">
              {uploadProgressText ? (
                <span className="flex items-center gap-2 text-[#8B5A2B] font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {uploadProgressText}
                </span>
              ) : (
                <span>* Required fields must be completed across sections</span>
              )}
            </div>

            <div className="flex items-center gap-3 self-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="bg-[#8B5A2B] hover:bg-[#6D4621] text-white flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEdit ? 'Save Changes' : 'Publish Masterpiece'}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
