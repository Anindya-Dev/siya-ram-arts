// =============================================================================
// Siya Ram Arts — Frontend TypeScript Contracts
// Aligned to backend camelCase API (app/schemas/product.py + BaseResponseSchema)
// Last updated: 2026-09-14 by Owner (seed/type alignment pass)
// =============================================================================

export type DeityCategory = string;
export type MaterialType = string;
export type IntentionType = string;

// ─── Paginated API response wrapper ──────────────────────────────────────────
// Matches PaginatedResponse in app/schemas/common.py (to_camel serialised)
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Product Variant ──────────────────────────────────────────────────────────
// Matches ProductVariantRead in app/schemas/product.py
export interface ProductVariant {
  id: string;
  productId: string;
  size: string;           // e.g. "9-inch", "15-inch", "18-inch", "24-inch"
  material: string;       // e.g. "White Marble Resin"
  finish: string;         // e.g. "Saffron & Gold Hand-Painted"
  basePrice: number;      // base price for this variant in INR (paise not used)
  priceDelta: number;     // difference from the product-level base price
  sku: string;
  isActive: boolean;
  totalAvailableStock: number; // computed: sum of (stock_count - reserved_count) across locations
}

// ─── Product Specification ────────────────────────────────────────────────────
// Canonical keys decided by Owner (2026-09-14) — matches seed.py specifications dict
// Backend stores this as a free-form Dict[str, Any]; frontend uses these keys.
export interface ProductSpecification {
  canonicalForm: string;        // e.g. "Kamadhenu Krishna playing Bansuri on Lotus"
  primaryMedium: string;        // replaces old "Finish" key
  ornamentationGrade: string;   // e.g. "24K Gold Leaf Vark"
  mudrasAttributes: string;     // e.g. "Abhaya Mudra, Varada Mudra"
  pedestalFoundation: string;   // e.g. "Pink Lotus Base"
  archComposition: string;      // e.g. "Single-figure composition"
  authenticationSeal: string;   // e.g. "SRA-CERT-2026-KR01"
  netWeight: string;            // replaces old "Weight" key, e.g. "11.2 kg"
  heightWidth: string;          // e.g. "15-inch height, 8-inch width"
  provenance: string;           // e.g. "Jaipur Artisan Atelier, Rajasthan"
  pratishthaStatus: string;     // e.g. "Pratishtha-ready" | "Requires consecration"
  craftsmanshipTime: string;    // e.g. "21 Days" — replaces old "Craftsmanship Time" key
}

// ─── Carver Quote ─────────────────────────────────────────────────────────────
export interface CarverQuote {
  quote: string;
  artisanName: string;
  artisanTitle: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────
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

// ─── Product ──────────────────────────────────────────────────────────────────
// Matches ProductRead in app/schemas/product.py (to_camel serialised)
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
  certificateNumber: string;
  isFeaturedMasterpiece?: boolean;
  featuredOrder?: number;
  carverQuote?: CarverQuote;
  images: {
    url: string;
    alt: string;
    isPrimary?: boolean;
    fileId?: string;
  }[];
  variants: ProductVariant[];
  specifications: ProductSpecification | Record<string, any>;
  sevaGuidelines: Record<string, string>;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── Inventory Item (Admin panel) ─────────────────────────────────────────────
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
    variantId?: string;
    size: string;
    stock: number;
    threshold: number;
    unit: 'pcs' | 'pairs' | 'custom';
    status: 'Healthy' | 'Low Stock' | 'Reserved' | 'Out of Stock';
  }[];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedMaterial: string;
  selectedOrnamentation: string;
  quantity: number;
  unitPrice: number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}
