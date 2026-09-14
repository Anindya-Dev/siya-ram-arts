export type DeityCategory = string;
export type MaterialType = string;
export type IntentionType = string;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  size: string; // e.g. "9-inch", "15-inch", "18-inch", "24-inch"
  material?: string;
  finish?: string;
  basePrice?: number;
  priceDelta: number; // difference from base price
  sku?: string;
  isActive?: boolean;
  createdAt?: string;
  totalAvailableStock?: number;
  // Compatibility fallbacks
  stockCount?: number;
  isLowStock?: boolean;
  status?: 'In Stock' | 'Low Stock' | 'Mandir Reserved' | 'Out of Stock' | string;
}

export interface ProductImage {
  url?: string;
  src?: string;
  alt: string;
  isPrimary?: boolean;
  is_primary?: boolean;
  aspectRatio?: string;
}

export interface ProductSpecification {
  canonicalForm?: string;
  primaryMedium?: string;
  ornamentationGrade?: string;
  mudrasAttributes?: string;
  pedestalFoundation?: string;
  archComposition?: string;
  authenticationSeal?: string;
  netWeight?: string;
  heightWidth?: string;
  provenance?: string;
  pratishthaStatus?: string;
  [key: string]: any;
}

export interface SevaGuidelines {
  panchamritAbhishek?: string;
  goldFoilCare?: string;
  chandanKumkum?: string;
  transitInstallation?: string;
  [key: string]: any;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  content: string;
  verifiedPatron: boolean;
  date: string;
  image?: string;
  altarName?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  deity: DeityCategory;
  deityForm: string;
  material: MaterialType;
  materialPurity: string;
  basePrice: number;
  originalPrice?: number;
  discountBadge?: string;
  rating: number;
  reviewCount: number;
  sku: string;
  atelier: string;
  shortDescription: string;
  longDescription: string;
  carverQuote?: {
    quote: string;
    artisanName: string;
    artisanTitle: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
  selectedVariantId?: string;
  specifications: ProductSpecification;
  sevaGuidelines: SevaGuidelines;
  tags: string[];
  certificateNumber: string;
  isFeaturedMasterpiece?: boolean;
  featuredOrder?: number;
  // Helper / fallback
  image?: string;
  totalAvailableStock?: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  atelier: string;
  deityForm: string;
  materialPurity: string;
  sizeAndWeight: string;
  basePrice: number;
  status: 'In Stock' | 'Low Stock' | 'Mandir Reserved' | 'Out of Stock' | string;
  variants: {
    size: string;
    stock: number;
    threshold: number;
    unit: 'pcs' | 'pairs' | 'custom';
    status: 'Healthy' | 'Low Stock' | 'Reserved' | 'Out of Stock';
  }[];
}

export interface CartItem {
  id?: string;
  product?: Product;
  productId?: string;
  variantId?: string;
  name?: string;
  image?: string;
  size?: string;
  material?: string;
  ornamentation?: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  selectedMaterial?: string;
  selectedOrnamentation?: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface CheckoutItemInput {
  variantId: string;
  locationId?: string;
  quantity: number;
  reservationId?: string;
}

export interface CheckoutPayload {
  items: CheckoutItemInput[];
  shippingAddressId: string;
  customerNotes?: string;
}

