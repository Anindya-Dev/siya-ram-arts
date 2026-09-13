import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { DeityCatalogSection } from '../components/home/DeityCatalogSection';
import { MasterpieceCarousel } from '../components/home/MasterpieceCarousel';
import { AuthenticitySection } from '../components/home/AuthenticitySection';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

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

      {/* Deity Catalog Section */}
      <DeityCatalogSection
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
