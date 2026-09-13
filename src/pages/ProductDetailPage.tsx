import React, { useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductDetails } from '../components/product/ProductDetails';
import { ProductStory } from '../components/product/ProductStory';
import { ProductTabs } from '../components/product/ProductTabs';
import { CompanionsSection } from '../components/product/CompanionsSection';
import { generateProductSchema } from '../lib/seo';

interface ProductDetailPageProps {
  productSlug: string;
  onAddToCart: (
    product: Product,
    selectedSize: string,
    selectedMaterial: string,
    selectedOrnamentation: string,
    quantity: number
  ) => void;
  onRequestConsecration: (productName?: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productSlug,
  onAddToCart,
  onRequestConsecration,
  onSelectProduct,
}) => {
  const product =
    PRODUCTS.find((p) => p.slug === productSlug) || PRODUCTS[0];

  // Inject Product JSON-LD schema
  useEffect(() => {
    const scriptId = 'product-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(generateProductSchema(product));

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [product]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '#' },
          { label: 'Sacred Murtis', href: '#' },
          { label: product.name },
        ]}
      />

      {/* Main Product Layout: Gallery (Left) & Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            certificateNumber={product.certificateNumber}
          />
        </div>

        <div className="lg:col-span-5">
          <ProductDetails
            product={product}
            onAddToCart={onAddToCart}
            onRequestConsecration={() => onRequestConsecration(product.name)}
          />
        </div>
      </div>

      {/* Deep Shilpa Shastra Story */}
      <ProductStory product={product} />

      {/* Tabs: Sacred Specifications, Consecration & Daily Seva Guidelines, Devotee Testimonials */}
      <ProductTabs product={product} />

      {/* Companions for Your Sanctum */}
      <CompanionsSection onSelectProduct={onSelectProduct} />
    </div>
  );
};
