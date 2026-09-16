import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { fetchApi } from '../lib/api';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductDetails } from '../components/product/ProductDetails';
import { ProductStory } from '../components/product/ProductStory';
import { ProductTabs } from '../components/product/ProductTabs';
import { CompanionsSection } from '../components/product/CompanionsSection';
import { generateProductSchema } from '../lib/seo';

interface ProductDetailPageProps {
  productSlug: string;
  onAddToCart: (product: Product, selectedSize: string, selectedMaterial: string, selectedOrnamentation: string, quantity: number) => void;
  onRequestConsecration: (productName?: string) => void;
  onSelectProduct: (slug: string) => void;
  onReturnToCatalog: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productSlug, onAddToCart, onRequestConsecration, onSelectProduct, onReturnToCatalog }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setProduct(null); setNotFound(false); setError(null);
    fetchApi<Product>(`/products/${encodeURIComponent(productSlug)}`)
      .then((data) => { if (!cancelled) setProduct(data); })
      .catch((requestError: Error) => {
        if (cancelled) return;
        if (requestError.message.includes('API Error (404)')) setNotFound(true);
        else setError(requestError.message || 'Unable to load this sacred murti.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productSlug]);

  useEffect(() => {
    if (!product) return;
    const scriptId = 'product-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script'); script.id = scriptId; script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(generateProductSchema(product));
    return () => document.getElementById(scriptId)?.remove();
  }, [product]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse"><div className="h-4 w-56 bg-[#EAE4DC] rounded mb-8" /><div className="grid grid-cols-1 lg:grid-cols-12 gap-8"><div className="lg:col-span-7 h-[32rem] rounded-md bg-[#F5F2ED]" /><div className="lg:col-span-5 space-y-5"><div className="h-10 w-3/4 bg-[#EAE4DC] rounded" /><div className="h-24 bg-[#F5F2ED] rounded" /><div className="h-32 bg-[#EAE4DC] rounded" /></div></div></div>;

  if (notFound || !product) return <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5"><AlertCircle className="w-10 h-10 mx-auto text-[#A34D3D]" /><h1 className="font-serif text-3xl font-bold text-[#3A2D20]">Sacred Murti Not Found</h1><p className="text-sm text-[#5C5248]">{error || 'This sacred murti is not currently available in our collection.'}</p><button onClick={onReturnToCatalog} className="inline-flex items-center gap-2 px-5 py-3 bg-[#8B5A2B] text-white rounded-sm text-sm font-serif font-bold"><ArrowLeft className="w-4 h-4" /> Return to Collection</button></div>;

  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12"><Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Sacred Murtis', href: '#' }, { label: product.name }]} /><div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"><div className="lg:col-span-7"><ProductGallery images={product.images} certificateNumber={product.certificateNumber} /></div><div className="lg:col-span-5"><ProductDetails product={product} onAddToCart={onAddToCart} onRequestConsecration={() => onRequestConsecration(product.name)} /></div></div><ProductStory product={product} /><ProductTabs product={product} /><CompanionsSection onSelectProduct={onSelectProduct} /></div>;
};
