import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Filter, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { getLiveProducts, getProductImageUrl } from '../../data/products';
import { Product } from '../../types';

interface DeityCatalogSectionProps {
  products?: Product[];
  onSelectProduct: (slug: string) => void;
}

export const GOD_COLLECTIONS = [
  {
    id: 'all',
    title: 'All Sacred Murtis',
    subtitle: 'COMPLETE ATELIER INVENTORY',
    description: 'Explore the complete masterwork collection of 34 consecrated handcrafted murtis.',
    deityFilter: 'all',
    bannerImage: '/static/idols/cow-krishna-bansuri-idol.png',
  },
  {
    id: 'krishna',
    title: 'Shri Krishna Idols Collection',
    subtitle: 'MURALIDHAR & BAL GOPAL',
    description: 'Beautiful forms of Lord Krishna, Bal Gopal, Kamadhenu Krishna, and Swarna Vastra masterpieces.',
    deityFilter: 'Shri Krishna',
    bannerImage: '/static/idols/swarna-vastra-kamadhenu-krishna.png',
  },
  {
    id: 'radha-krishna',
    title: 'Radha Krishna Yugal Collection',
    subtitle: 'PREMANANDA & YUGAL SARKAR',
    description: 'Divine Radha Krishna duo statues, Shvetambara pairs, Vrindavan kunja, and pastel elegance sculptures.',
    deityFilter: 'Radha Krishna',
    bannerImage: '/static/idols/white-marble-radha-krishna-cow.png',
  },
  {
    id: 'buddha',
    title: 'Lord Buddha Idols Collection',
    subtitle: 'SHANTI & MEDITATION',
    description: 'Peaceful Gautama Buddha statues in Dhyana mudra, Bhumisparsha mudra, and golden lotus thrones.',
    deityFilter: 'Gautam Buddha',
    bannerImage: '/static/idols/dual-tone-bhumisparsha-buddha.png',
  },
  {
    id: 'shiv-parivar',
    title: 'Shiv Parivar & Mahadev Collection',
    subtitle: 'KAILASH SANCTUM BLESSINGS',
    description: 'Auspicious Shiv Parivar ensembles featuring Bhagwan Mahadev, Mata Parvati, and Bal Ganesha.',
    deityFilter: 'Shiv Parivar',
    bannerImage: '/static/idols/kailash-shiv-parvati-ganesha.png',
  },
  {
    id: 'ganesha',
    title: 'Lord Ganesha Idols Collection',
    subtitle: 'VIGHNAHARTA & SIDDHIVINAYAK',
    description: 'Auspicious Ganesha statues for home threshold, Paan Patta green leaf backrest, and office sanctums.',
    deityFilter: 'Shri Ganesha',
    bannerImage: '/static/idols/paan-patta-green-leaf-ganesha.png',
  },
  {
    id: 'durga-hanuman',
    title: 'Devi Durga, Hanuman Ji & Khatu Shyam Collection',
    subtitle: 'SHAKTI, VIRATA & SEVA',
    description: 'Sherawali Durga Maa on golden tiger, Sanjeevani Hanuman Ji, and Khatu Shyam Ji Sheesh avatar.',
    deityFilter: 'Durga & Hanuman',
    bannerImage: '/static/idols/sherawali-durga-maa-tiger.png',
  },
];

export const DeityCatalogSection: React.FC<DeityCatalogSectionProps> = ({
  products: initialProducts,
  onSelectProduct,
}) => {
  const [activeCollection, setActiveCollection] = useState<string>('all');
  const [selectedDeity, setSelectedDeity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState<boolean>(!initialProducts || initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLiveProducts(50);
      setProducts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load sacred murtis catalog.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
    } else {
      loadProducts();
    }
  }, [initialProducts]);

  const sourceProducts = products.length > 0 ? products : (initialProducts || []);

  // Filter products by active collection and deity
  const filteredProducts = sourceProducts.filter((product) => {
    // Collection Filter logic
    let matchesCollection = true;
    if (activeCollection === 'krishna') {
      matchesCollection = product.deity === 'Shri Krishna';
    } else if (activeCollection === 'radha-krishna') {
      matchesCollection = product.deity === 'Radha Krishna';
    } else if (activeCollection === 'buddha') {
      matchesCollection = product.deity === 'Gautam Buddha';
    } else if (activeCollection === 'shiv-parivar') {
      matchesCollection = product.deity === 'Shiv Parivar';
    } else if (activeCollection === 'ganesha') {
      matchesCollection = product.deity === 'Shri Ganesha';
    } else if (activeCollection === 'durga-hanuman') {
      matchesCollection = ['Maa Durga', 'Lord Hanuman', 'Khatu Shyam Ji'].includes(product.deity);
    }

    // Secondary Deity filter button selection
    let matchesDeity = true;
    if (selectedDeity !== 'All') {
      if (selectedDeity === 'Krishna & Radha') {
        matchesDeity = product.deity === 'Shri Krishna' || product.deity === 'Radha Krishna';
      } else if (selectedDeity === 'Buddha') {
        matchesDeity = product.deity === 'Gautam Buddha';
      } else if (selectedDeity === 'Shiva & Parivar') {
        matchesDeity = product.deity === 'Shiv Parivar';
      } else if (selectedDeity === 'Ganesha') {
        matchesDeity = product.deity === 'Shri Ganesha';
      } else if (selectedDeity === 'Durga & Hanuman & Shyam') {
        matchesDeity = ['Maa Durga', 'Lord Hanuman', 'Khatu Shyam Ji'].includes(product.deity);
      }
    }

    // Search query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.deity.toLowerCase().includes(q) ||
        (product.deityForm && product.deityForm.toLowerCase().includes(q)) ||
        (product.material && product.material.toLowerCase().includes(q));
    }

    const price = product.basePrice;
    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === 'under-25000' && price < 25000) ||
      (priceRange === '25000-50000' && price >= 25000 && price <= 50000) ||
      (priceRange === 'over-50000' && price > 50000);

    return matchesCollection && matchesDeity && matchesSearch && matchesPrice;
  });

  return (
    <section id="catalog" className="py-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5F2ED] border border-[#D4AF37]/30 text-[#8B5A2B] text-xs font-serif uppercase tracking-widest font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Complete Sacred Vigraha Collection</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A2D20] tracking-tight">
            Handcrafted Murtis by Master Jaipuri Artisans
          </h2>
          <p className="text-sm text-[#5C5248] font-sans leading-relaxed">
            Every sacred vigraha is sculpted adhering to ancient Shilpa Shastra canons with authentic Talamana iconometry, pure 24K gold foil vark, and water-sealed durability.
          </p>
        </div>

        {/* Collection Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 mb-10">
          {GOD_COLLECTIONS.map((col) => {
            const isActive = activeCollection === col.id;
            return (
              <button
                key={col.id}
                onClick={() => {
                  setActiveCollection(col.id);
                  setSelectedDeity('All');
                }}
                className={cn(
                  'p-3 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group',
                  isActive
                    ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-md ring-2 ring-[#D4AF37]/40'
                    : 'bg-[#FFFDF5] text-[#3A2D20] border-[#D4AF37]/25 hover:border-[#8B5A2B]/60 hover:bg-white'
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={cn('text-[9px] uppercase tracking-wider font-serif font-bold', isActive ? 'text-[#F3E5AB]' : 'text-[#A67C52]')}>
                    {col.id === 'all' ? `${sourceProducts.length} Idols` : col.subtitle.split('&')[0]}
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </div>
                <h3 className="font-serif text-xs font-bold leading-snug line-clamp-2">
                  {col.title.replace(' Collection', '')}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Filter Bar (Deities Filter & Count) */}
        <div className="mb-8 p-4 bg-[#F5F2ED] rounded-lg border border-[#D4AF37]/25 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Deity Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-serif font-semibold text-[#3A2D20] flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-[#8B5A2B]" />
              Filter Deity:
            </span>
            {[
              { id: 'All', label: 'All Deities' },
              { id: 'Krishna & Radha', label: 'Krishna & Radha' },
              { id: 'Buddha', label: 'Buddha' },
              { id: 'Shiva & Parivar', label: 'Shiv Parivar' },
              { id: 'Ganesha', label: 'Ganesha' },
              { id: 'Durga & Hanuman & Shyam', label: 'Durga / Hanuman / Shyam' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedDeity(btn.id)}
                className={cn(
                  'px-3 py-1 text-xs font-serif rounded-full transition-all border',
                  selectedDeity === btn.id
                    ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-2xs font-bold'
                    : 'bg-white text-[#5C5248] border-[#D4AF37]/30 hover:border-[#8B5A2B]'
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-serif font-semibold text-[#3A2D20]">Price:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'under-25000', label: 'Under ₹25k' },
              { id: '25000-50000', label: '₹25k–₹50k' },
              { id: 'over-50000', label: 'Above ₹50k' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setPriceRange(range.id)}
                className={cn(
                  'px-3 py-1 text-xs font-serif rounded-full transition-all border',
                  priceRange === range.id
                    ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] font-bold'
                    : 'bg-white text-[#5C5248] border-[#D4AF37]/30 hover:border-[#8B5A2B]'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Results Count & Search Input */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-serif text-[#8B5A2B] font-bold shrink-0">
              Showing {filteredProducts.length} Murtis
            </span>
            <input
              type="text"
              placeholder="Search by name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 text-xs bg-[#FFFDF5] border border-[#D4AF37]/30 rounded-sm focus:outline-none text-[#2D2D2D] w-36 sm:w-44"
            />
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && sourceProducts.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#F5F2ED] rounded-md border border-[#D4AF37]/20 h-96 flex flex-col justify-between p-4">
                <div className="h-64 bg-[#EAE4DC] rounded-sm w-full" />
                <div className="space-y-2 mt-4">
                  <div className="h-3 bg-[#EAE4DC] rounded-xs w-1/3" />
                  <div className="h-4 bg-[#EAE4DC] rounded-xs w-3/4" />
                  <div className="h-4 bg-[#EAE4DC] rounded-xs w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && sourceProducts.length === 0 && (
          <div className="text-center py-16 bg-[#FFFDF5] rounded-xl border border-red-200 p-6 space-y-4">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-sm font-serif text-red-700">{error}</p>
            <button
              onClick={loadProducts}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B5A2B] text-white text-xs font-serif rounded-sm hover:bg-[#724923] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading Catalog</span>
            </button>
          </div>
        )}

        {/* Murtis Cards Grid */}
        {(!loading || sourceProducts.length > 0) && filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFDF5] rounded-xl border border-[#D4AF37]/20">
            <p className="text-base font-serif text-[#5C5248]">No murtis match your search filter.</p>
            <button
              onClick={() => {
                setActiveCollection('all');
                setSelectedDeity('All');
                setSearchQuery('');
                setPriceRange('all');
              }}
              className="mt-3 text-xs font-serif text-[#8B5A2B] underline font-bold"
            >
              Reset Filters to View All {sourceProducts.length} Idols
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const imageSrc = getProductImageUrl(product.images?.[0]) || '/static/idols/swarna-vastra-kamadhenu-krishna.png';
              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product.slug)}
                  className="group bg-[#FFFDF5] border border-[#D4AF37]/25 rounded-md overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative h-72 w-full bg-[#F5F2ED] overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    {/* SKU Tag */}
                    <div className="absolute top-3 left-3 bg-[#FFFDF5]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-xs border border-[#D4AF37]/30 text-[10px] font-serif font-bold text-[#8B5A2B]">
                      {product.sku}
                    </div>

                    {/* Discount Badge if any */}
                    {product.discountBadge && (
                      <div className="absolute top-3 right-3 bg-[#8B5A2B] text-white px-2 py-0.5 rounded-xs text-[9px] font-serif uppercase tracking-wider font-semibold">
                        {product.discountBadge}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] tracking-[0.2em] font-serif uppercase text-[#A67C52] font-semibold block mb-0.5">
                        {product.deity}
                      </span>
                      <h3 className="font-serif text-base font-bold text-[#3A2D20] group-hover:text-[#8B5A2B] transition-colors leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#5C5248] line-clamp-2 font-sans leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>

                    {/* Pricing and Action */}
                    <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs font-serif">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#8A8177] block">
                          Offering
                        </span>
                        <span className="text-base font-bold text-[#8B5A2B]">
                          {formatCurrency(product.basePrice)}
                        </span>
                      </div>

                      <span className="text-[#8B5A2B] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold text-xs">
                        View Murti <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
