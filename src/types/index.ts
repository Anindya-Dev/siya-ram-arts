export type DeityCategory = string;
export type MaterialType = string;
export type IntentionType = string;

export interface ProductVariant {
  id: string;
  size: string; // e.g. "9-inch", "15-inch", "18-inch", "24-inch"
  stockCount: number;
  priceDelta: number; // difference from base price
  isLowStock?: boolean;
  status: 'In Stock' | 'Low Stock' | 'Mandir Reserved' | 'Out of Stock';
}

export interface ProductSpecification {
  canonicalForm: string;
  primaryMedium: string;
  ornamentationGrade: string;
  mudrasAttributes: string;
  pedestalFoundation: string;
  archComposition: string;
  authenticationSeal: string;
  netWeight: string;
  heightWidth: string;
  provenance: string;
  pratishthaStatus: string;
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
  images: {
    src: string;
    alt: string;
    isPrimary?: boolean;
    aspectRatio?: string;
  }[];
  variants: ProductVariant[];
  selectedVariantId?: string;
  specifications: ProductSpecification;
  sevaGuidelines: {
    panchamritAbhishek: string;
    goldFoilCare: string;
    chandanKumkum: string;
    transitInstallation: string;
  };
  tags: string[];
  certificateNumber: string;
  isFeaturedMasterpiece?: boolean;
  featuredOrder?: number;
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
  status: 'In Stock' | 'Low Stock' | 'Mandir Reserved' | 'Out of Stock';
  variants: {
    size: string;
    stock: number;
    threshold: number;
    unit: 'pcs' | 'pairs' | 'custom';
    status: 'Healthy' | 'Low Stock' | 'Reserved' | 'Out of Stock';
  }[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedMaterial: string;
  selectedOrnamentation: string;
  quantity: number;
  unitPrice: number;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}
