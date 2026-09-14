import React, { useEffect, useState } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { DeityCatalogSection } from '../components/home/DeityCatalogSection';
import { MasterpieceCarousel } from '../components/home/MasterpieceCarousel';
import { AuthenticitySection } from '../components/home/AuthenticitySection';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { getLiveProducts } from '../data/products';
import { Product } from '../types';

interface HomePageProps {
  onNavigateProduct: (slug: string) => void;
  onExploreCatalog: () => void;
  onRequestConsecration: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateProduct,
  onExploreCatalog,
  onRequestConsecration,
}) => {
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);

  useEffect(() => {
    getLiveProducts()
      .then((data) => {
        if (data && data.length > 0) {
          setLiveProducts(data);
        }
      })
      .catch((err) => console.error("Failed to load live catalog:", err));
  }, []);

  return (
    <div className="space-y-0">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#' },
            { label: 'Sacred Sanctum Collection' },
          ]}
        />
      </div>

      {/* Hero Section */}
      <HeroSection
        onExploreClick={() => {
          const el = document.getElementById('deities');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onFeaturedClick={() => {
          onNavigateProduct('swarna-vastra-kamadhenu-krishna-masterpiece');
        }}
      />

      {/* Deity Catalog Section with Live Products */}
      <DeityCatalogSection
        products={liveProducts}
        onSelectProduct={(slug) => {
          onNavigateProduct(slug);
        }}
      />

      {/* Handcrafted Masterpiece Carousel */}
      <MasterpieceCarousel onSelectProduct={onNavigateProduct} />

      {/* Vedic Authenticity & Shilpa Shastra Lineage */}
      <AuthenticitySection />
    </div>
  );
};