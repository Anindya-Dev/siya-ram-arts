import React, { useState } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Package,
  MapPin,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavbarProps {
  currentView: 'home' | 'product' | 'admin';
  onNavigate: (view: 'home' | 'product' | 'admin', slug?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentUser: { name: string; imageUrl?: string; role: 'admin' | 'user' } | null;
  clerkLoaded: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onOpenTrackOrder: () => void;
  onOpenCustomIdol?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  currentUser,
  clerkLoaded,
  onLoginClick,
  onLogout,
  onOpenTrackOrder,
  onOpenCustomIdol,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuItems = [
    { icon: Package, label: 'My Orders', id: 'menu-my-orders', action: undefined as (() => void) | undefined },
    { icon: MapPin, label: 'Track Order', id: 'menu-track-order', action: onOpenTrackOrder },
    { icon: Heart, label: 'My Wishlist', id: 'menu-wishlist', action: onOpenWishlist },
    { icon: Settings, label: 'Account Settings', id: 'menu-settings', action: undefined as (() => void) | undefined },
    { icon: HelpCircle, label: 'Help & Support', id: 'menu-help', action: undefined as (() => void) | undefined },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF5] border-b border-[#D4AF37]/30 shadow-2xs">
      {/* Top Ribbon */}
      <div className="bg-[#8B5A2B] text-[#FFFDF5] text-[11px] sm:text-xs font-serif tracking-[0.2em] py-1.5 px-4 text-center border-b border-[#724923] flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
        <span className="truncate">
          HANDCRAFTED IN JAIPUR &nbsp;|&nbsp; SPECIAL PACKAGING &amp; SHIPPING WORLDWIDE
        </span>
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-8 h-8 flex items-center justify-center border border-[#A67C52] rounded-full text-[#A67C52] text-xs font-serif italic bg-[#FFFDF5] group-hover:border-[#8B5A2B] group-hover:text-[#8B5A2B] transition-colors">
                SR
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl tracking-tighter text-[#8B5A2B] font-bold group-hover:text-[#724923] transition-colors leading-none">
                  Siya Ram Arts
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#A67C52] font-semibold mt-0.5 opacity-80">
                  Jaipur Studio
                </span>
              </div>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="hidden xl:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-[#2D2D2D] opacity-80">
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('collections');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={cn(
                'hover:text-[#8B5A2B] transition-colors flex items-center gap-1 pb-1',
                currentView === 'home' && 'border-b border-[#8B5A2B] text-[#8B5A2B] font-bold opacity-100'
              )}
            >
              Collections
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('deities');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#8B5A2B] transition-colors pb-1"
            >
              Deities
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('about-us');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#8B5A2B] transition-colors pb-1"
            >
              About Us
            </button>

            {/* Custom Idol Order Modal Trigger */}
            <button
              onClick={onOpenCustomIdol}
              className="px-2.5 py-1 rounded bg-[#F5F2ED] border border-[#D4AF37]/40 text-[#8B5A2B] hover:bg-[#8B5A2B] hover:text-white transition-all flex items-center gap-1 font-bold text-[10px]"
            >
              <span>✨ Custom Idol</span>
            </button>

            {/* Contact Us WhatsApp Redirection */}
            <a
              href="https://wa.me/919876286046?text=Namaste%20Siya%20Ram%20Arts!%20%F0%9F%99%8F%0AI%20would%20like%20to%20inquire%20about%20your%20handcrafted%20sacred%20murtis%20and%20temple%20vigrahas."
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#25D366] text-[#2E7D32] transition-colors pb-1 font-bold flex items-center gap-1"
            >
              <span>Contact Us</span>
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative hidden md:block w-48 lg:w-56">
              <input
                type="text"
                placeholder="Search murtis..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#F5F2ED] border border-[#D4AF37]/30 rounded-sm focus:bg-white focus:border-[#8B5A2B] focus:outline-none transition-all placeholder:text-[#8C8276] text-[#2D2D2D]"
              />
              <Search className="w-3.5 h-3.5 text-[#A67C52] absolute left-2.5 top-2 pointer-events-none" />
            </div>

            {/* Wishlist */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              aria-label={`Wishlist, ${wishlistCount} items`}
              className="relative p-2 text-[#5C5248] hover:text-[#8B5A2B] hover:bg-[#F5F2ED] rounded-full transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#D4AF37] text-[#2D2D2D] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              id="cart-btn"
              onClick={onOpenCart}
              aria-label={`Cart with ${cartCount} items`}
              className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#2D2D2D] hover:text-[#8B5A2B] transition-colors"
              title="My Bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#5C5248]" />
              <span className="hidden sm:inline font-sans">Bag</span>
              <span className="w-5 h-5 flex items-center justify-center bg-[#A67C52] text-white rounded-full text-[9px] font-bold">
                {cartCount}
              </span>
            </button>

            {/* Login / User Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#D4AF37]/40 bg-[#F5F2ED] hover:bg-[#EDE9E1] text-xs font-serif text-[#8B5A2B] transition-colors"
                >
                  {currentUser.imageUrl ? (
                    <img src={currentUser.imageUrl} alt={currentUser.name} className="w-5 h-5 rounded-full object-cover" />
                  ) : currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name}</span>
                  <ChevronDown className={cn('w-3 h-3 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <>
                    {/* Click outside to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-[#D4AF37]/30 rounded-sm shadow-xl z-50 overflow-hidden">
                      {/* User header */}
                      <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#D4AF37]/20">
                        <p className="text-xs font-bold text-[#3A2D20] font-serif">{currentUser.name}</p>
                        <p className="text-[10px] text-[#8C7A6A] mt-0.5">
                          {currentUser.role === 'admin' ? '⚙️ Admin Account' : '👤 Customer Account'}
                        </p>
                      </div>

                      <div className="py-1">
                        {/* Admin Dashboard */}
                        {currentUser.role === 'admin' && (
                          <button
                            id="menu-admin-dashboard"
                            onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-serif text-[#8B5A2B] hover:bg-[#FDF6E9] flex items-center gap-2.5 font-semibold"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin Dashboard
                          </button>
                        )}

                        {/* Divider for admin */}
                        {currentUser.role === 'admin' && <div className="my-1 border-t border-[#D4AF37]/15" />}

                        {/* User menu items */}
                        {userMenuItems.map((item) => (
                          <button
                            key={item.id}
                            id={item.id}
                            onClick={() => {
                              item.action?.();
                              setUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-serif text-[#3A2D20] hover:bg-[#F5F2ED] flex items-center gap-2.5 transition-colors"
                          >
                            <item.icon className="w-3.5 h-3.5 text-[#A67C52]" />
                            {item.label}
                          </button>
                        ))}

                        <div className="my-1 border-t border-[#D4AF37]/15" />

                        {/* Sign Out */}
                        <button
                          id="menu-sign-out"
                          onClick={() => { onLogout(); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-serif text-[#C0392B] hover:bg-[#FFF5F5] flex items-center gap-2.5 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : !clerkLoaded ? (
              // Clerk still loading — show skeleton so Login doesn't flash for signed-in users
              <div className="w-20 h-7 rounded-sm bg-[#E8DDD0] animate-pulse" />
            ) : (
              <button
                id="login-btn"
                onClick={onLoginClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#8B5A2B] hover:bg-[#724923] text-white text-xs font-serif tracking-wide transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}


            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-[#5C5248] hover:text-[#8B5A2B] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#FFFDF5] border-b border-[#D4AF37]/30 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#D4AF37]/20 text-xs font-serif">
            {[
              { label: 'Home', view: 'home' as const },
              { label: 'Products', view: 'product' as const },
            ].map(({ label, view }) => (
              <button
                key={view}
                onClick={() => { onNavigate(view); setMobileMenuOpen(false); }}
                className={cn(
                  'p-2 rounded-sm text-center border',
                  currentView === view
                    ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]'
                    : 'bg-[#F5F2ED] text-[#5C5248] border-[#D4AF37]/30'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search murtis..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#F5F2ED] border border-[#D4AF37]/30 rounded-sm focus:outline-none"
          />
        </div>
      )}
    </header>
  );
};
