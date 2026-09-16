import React, { useState, useEffect } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ReturnsPolicyPage } from './pages/ReturnsPolicyPage';
import { CartDrawer, CartItem } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { WishlistDrawer, WishlistItem } from './components/cart/WishlistDrawer';
import { ConsecrationModal } from './components/common/ConsecrationModal';
import { LoginModal } from './components/common/LoginModal';
import { TrackOrderModal } from './components/common/TrackOrderModal';
import { CustomIdolModal } from './components/common/CustomIdolModal';
import { Product } from './types';
import { fetchApi } from './lib/api';

export default function App() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut, openSignIn } = useClerk();
  const { getToken } = useAuth();

  // Admin: ONLY via publicMetadata role set in Clerk Dashboard by the developer
  // Second gate: server-side ADMIN_EMAILS whitelist in .env (checked by /api/v1/auth/verify-admin)
  const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin';

  // Navigation
  const [currentPage, setCurrentPage] = useState<'home' | 'product' | 'admin' | 'terms' | 'privacy' | 'returns'>('home');
  const [activeProductSlug, setActiveProductSlug] = useState('');

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Wishlist
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
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

  const handleAddToCart = async (
    product: Product,
    size: string,
    material: string,
    ornamentation: string,
    quantity: number
  ) => {
    const variant = product.variants.find((v) => v.size === size && v.material === material) || product.variants.find((v) => v.size === size);
    if (!variant) {
      window.alert('This murti variant is no longer available. Please select another size.');
      return;
    }
    try {
      const token = isSignedIn ? await getToken() : null;
      const reservation = await fetchApi<{ id: string; quantity: number }>('/inventory/reserve', {
        method: 'POST', token, body: JSON.stringify({ variantId: variant.id, quantity }),
      });

      setCartItems((prev) => [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          productId: product.id,
          variantId: variant.id,
          reservationId: reservation.id,
          reservedQuantity: reservation.quantity,
          name: product.name,
          image: product.images[0]?.url || '',
          size,
          material,
          ornamentation,
          unitPrice: variant.basePrice,
          quantity,
        },
      ]);
      setIsCartOpen(true);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to reserve this murti. Please try again.');
    }
  };

  const handleAddWishlistToCart = (_item: WishlistItem) => {
    window.alert('Please select a size and finish from the product page before adding this murti to your bag.');
  };

  const handleUpdateCartQty = async (id: string, newQty: number) => {
    const item = cartItems.find((entry) => entry.id === id);
    if (!item || newQty < 1 || newQty === item.quantity) return;
    try {
      const token = isSignedIn ? await getToken() : null;
      const reservation = await fetchApi<{ id: string; quantity: number }>('/inventory/reserve', {
        method: 'POST', token, body: JSON.stringify({ variantId: item.variantId, quantity: newQty }),
      });
      if (item.reservationId) {
        await fetchApi(`/inventory/release/${item.reservationId}`, { method: 'POST', token });
      }
      setCartItems((previous) => previous.map((entry) => entry.id === id ? {
        ...entry, quantity: newQty, reservationId: reservation.id, reservedQuantity: reservation.quantity,
      } : entry));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to update the reserved quantity.');
    }
  };

  const handleRemoveCartItem = async (id: string) => {
    const item = cartItems.find((entry) => entry.id === id);
    setCartItems((prev) => prev.filter((entry) => entry.id !== id));
    if (!item?.reservationId) return;
    try {
      const token = isSignedIn ? await getToken() : null;
      await fetchApi(`/inventory/release/${item.reservationId}`, { method: 'POST', token });
    } catch (error) {
      console.warn('Could not release cart reservation:', error);
    }
  };

  const handleCheckout = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    setCheckoutOpen(true);
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
        {currentPage === 'terms' && (
          <TermsOfServicePage onNavigate={(p) => setCurrentPage(p as any)} />
        )}
        {currentPage === 'privacy' && (
          <PrivacyPolicyPage onNavigate={(p) => setCurrentPage(p as any)} />
        )}
        {currentPage === 'returns' && (
          <ReturnsPolicyPage onNavigate={(p) => setCurrentPage(p as any)} />
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
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        items={cartItems}
        getToken={getToken}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          setCartItems([]);
          setCheckoutOpen(false);
          setIsCartOpen(false);
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
