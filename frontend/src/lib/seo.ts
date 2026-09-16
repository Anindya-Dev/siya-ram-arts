import { Product, BreadcrumbItem } from '../types';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Siya Ram Arts',
    url: 'https://siyaramarts.com',
    logo: 'https://siyaramarts.com/assets/logo.png',
    description: 'Premier artisans of sacred Vedic temple-grade murtis in premium chemical resin casting, durable polymer composite, and hand-finished polychrome.',
    foundingLocation: {
      '@type': 'Place',
      name: 'Jaipur, Rajasthan, Bharat',
    },
    knowsAbout: [
      'Shilpa Shastras',
      'Handcrafted Chemical Resin Casting',
      'High-Density Polymer Composite Murtis',
      'Prana Pratishtha Consecration',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-141-2601947',
      contactType: 'Devotee Concierge & Sthapathi Consultation',
      areaServed: ['IN', 'US', 'GB', 'AE', 'SG', 'CA', 'AU'],
      availableLanguage: ['English', 'Hindi', 'Sanskrit'],
    },
  };
}

export function generateProductSchema(product: Product) {
  const selectedVariant = product.variants[0];
  const calculatedPrice = product.basePrice + (selectedVariant?.priceDelta || 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map(img => img.url),
    description: product.longDescription,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Siya Ram Arts',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: calculatedPrice.toString(),
      itemCondition: 'https://schema.org/NewCondition',
      availability: (selectedVariant?.totalAvailableStock ?? 0) > 0
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Siya Ram Arts',
      },
    },
    material: product.materialPurity,
    weight: {
      '@type': 'QuantitativeValue',
      value: product.specifications.netWeight,
    },
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://siyaramarts.com${item.href}`,
    })),
  };
}
