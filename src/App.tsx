import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CartDrawer, CartItem } from './components/cart/CartDrawer';
import { WishlistDrawer, WishlistItem } from './components/cart/WishlistDrawer';
import { ConsecrationModal } from './components/common/ConsecrationModal';
import { LoginModal } from './components/common/LoginModal';
import { TrackOrderModal } from './components/common/TrackOrderModal';
import { CustomIdolModal } from './components/common/CustomIdolModal';
import { Product } from './types';

export default function App() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Admin: ONLY via publicMetadata role set in Clerk Dashboard by the developer
  // Second gate: server-side ADMIN_EMAILS whitelist in .env (checked by /api/v1/auth/verify-admin)
  const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin';

  // Navigation
  const [currentPage, setCurrentPage] = useState<'home' | 'product' | 'admin'>('home');
  const [activeProductSlug, setActiveProductSlug] = useState('handcrafted-chemical-resin-ram-lalla');

  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [customIdolModalOpen, setCustomIdolModalOpen] = useState(false);

  // Auto-close login modal the moment Clerk confirms sign-in
  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      setLoginModalOpen(false);
    }
  }, [isLoaded, isSignedIn]);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-1',
      productId: 'prod-ram-lalla-1',
      name: 'Divya Shila Ram Lalla Vigraha',
      image: '/static/idols/divya-shila-ram-lalla.png',
      size: '12-inch',
      material: 'Black Shila Resin',
      ornamentation: '24K Gold Leaf Vark & Real Emerald Coloration',
      unitPrice: 28500,
      quantity: 1,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 'wish-1',
      productId: 'prod-ram-lalla-1',
      name: 'Divya Shila Ram Lalla Vigraha',
      image: '/static/idols/divya-shila-ram-lalla.png',
      price: 28500,
    },
    {
      id: 'wish-2',
      productId: 'prod-ganesha-1',
      name: 'Siddhi Vinayaka Ganesha',
      image: '/static/idols/siddhi-vinayaka-ganesha.png',
      price: 18500,
    },
    {
      id: 'wish-3',
      productId: 'prod-ganesha-3',
      name: 'Subha Drishti Ganesha and Lakshmi',
      image: '/static/idols/subha-drishti-ganesha-and-lakshmi.png',
      price: 24500,
    },
  ]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Consecration Modal
  const [consecrationModalOpen, setConsecrationModalOpen] = useState(false);
  const [consecrationProductName, setConsecrationProductName] = useState('Ram Lalla Murti');

  // Close login modal automatically when user signs in
  useEffect(() => {
    if (isSignedIn) setLoginModalOpen(false);
  }, [isSignedIn]);

  // Sync route from URL / hash
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setCurrentPage('admin');
      }
    };
    handleLocation();
    window.addEventListener('popstate', handleLocation);
    window.addEventListener('hashchange', handleLocation);
    return () => {
      window.removeEventListener('popstate', handleLocation);
      window.removeEventListener('hashchange', handleLocation);
    };
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const handleAddToCart = (
    product: Product,
    size: string,
    material: string,
    ornamentation: string,
    quantity: number
  ) => {
    const variant = product.variants.find((v) => v.size.includes(size));
    const ornamentationAdjustment = ornamentation.includes('Unpainted') ? -4500 : 0;
    const unitPrice = product.basePrice + (variant?.priceDelta || 0) + ornamentationAdjustment;

    setCartItems((prev) => [
      ...prev,
      {
        id: `cart-${Date.now()}`,
        productId: product.id,
        name: product.name,
        image: product.images[0]?.src || '',
        size,
        material,
        ornamentation,
        unitPrice,
        quantity,
      },
    ]);
    setIsCartOpen(true);
  };

  const handleAddWishlistToCart = (item: WishlistItem) => {
    setCartItems((prev) => [
      ...prev,
      {
        id: `cart-${Date.now()}`,
        productId: item.productId,
        name: item.name,
        image: item.image,
        size: 'Standard',
        material: 'Chemical Resin',
        ornamentation: 'Standard',
        unitPrice: item.price,
        quantity: 1,
      },
    ]);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (id: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRemoveWishlistItem = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenConsecration = (productName?: string) => {
    setConsecrationProductName(productName || 'Sacred Murti');
    setConsecrationModalOpen(true);
  };

  const handleNavigateProduct = (slug: string) => {
    setActiveProductSlug(slug);
    setCurrentPage('product');
  };

  const currentUser =
    isSignedIn && isLoaded
      ? {
          name: user.firstName || user.emailAddresses[0]?.emailAddress || 'User',
          imageUrl: user.imageUrl,
          role: (isAdmin ? 'admin' : 'user') as 'admin' | 'user',
        }
      : null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241F1C] flex flex-col selection:bg-[#E8D6BF] selection:text-[#5B3917]">
      <Navbar
        currentView={currentPage}
        onNavigate={setCurrentPage}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistItems.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery=""
        onSearchChange={() => {}}
        currentUser={currentUser}
        clerkLoaded={isLoaded}
        onLoginClick={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenTrackOrder={() => setTrackOrderOpen(true)}
        onOpenCustomIdol={() => setCustomIdolModalOpen(true)}
      />


      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigateProduct={handleNavigateProduct}
            onExploreCatalog={() => setCurrentPage('admin')}
            onRequestConsecration={() => handleOpenConsecration('Ayodhya Ram Lalla')}
          />
        )}
        {currentPage === 'product' && (
          <ProductDetailPage
            productSlug={activeProductSlug}
            onAddToCart={handleAddToCart}
            onRequestConsecration={handleOpenConsecration}
            onSelectProduct={handleNavigateProduct}
            onReturnToCatalog={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'admin' && (
          isLoaded && isAdmin
            ? <AdminDashboardPage />
            : isLoaded && isSignedIn && !isAdmin
              ? (
                // Signed in but NOT admin — show Access Denied
                <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                  <div className="text-center max-w-sm mx-auto px-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
                      <span className="text-2xl">🚫</span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-[#3A2D20]">Access Denied</h2>
                    <p className="text-sm text-[#7A6A5A] font-serif">
                      You don't have permission to view the admin panel.
                      Please contact the site owner if you believe this is a mistake.
                    </p>
                    <button
                      onClick={() => setCurrentPage('home')}
                      className="px-6 py-2 bg-[#8B5A2B] hover:bg-[#724923] text-white text-sm font-serif rounded-sm transition-colors"
                    >
                      Go Back to Home
                    </button>
                  </div>
                </div>
              )
              : (
                // Not signed in — prompt login
                <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                  <div className="text-center max-w-sm mx-auto px-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#FDF6E9] border border-[#D4AF37]/30 flex items-center justify-center mx-auto">
                      <span className="text-2xl">🔐</span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-[#3A2D20]">Admin Login Required</h2>
                    <p className="text-sm text-[#7A6A5A] font-serif">
                      Please sign in with your admin account to access this area.
                    </p>
                    <button
                      onClick={() => setLoginModalOpen(true)}
                      className="px-6 py-2 bg-[#8B5A2B] hover:bg-[#724923] text-white text-sm font-serif rounded-sm transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )
        )}
      </main>

      <Footer onNavigate={setCurrentPage} />

      {/* Cart */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          handleOpenConsecration('Cart Order');
        }}
      />

      {/* Wishlist */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistItems}
        onRemoveItem={handleRemoveWishlistItem}
        onAddToCart={handleAddWishlistToCart}
      />

      {/* Blessing Modal */}
      <ConsecrationModal
        isOpen={consecrationModalOpen}
        onClose={() => setConsecrationModalOpen(false)}
        productName={consecrationProductName}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={trackOrderOpen}
        onClose={() => setTrackOrderOpen(false)}
      />

      {/* Custom Idol Modal */}
      <CustomIdolModal
        isOpen={customIdolModalOpen}
        onClose={() => setCustomIdolModalOpen(false)}
      />
    </div>
  );
}
