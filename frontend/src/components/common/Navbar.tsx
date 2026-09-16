import React, { useState } from 'react';
import {
  MagnifyingGlass,
  Heart,
  Bag,
  CaretDown,
  Sparkle,
  List,
  X,
  SignIn,
  SignOut,
  User,
  ShieldCheck,
  Package,
  MapPin,
  Gear,
  Question,
} from '@phosphor-icons/react';
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
    { icon: Gear, label: 'Account Settings', id: 'menu-settings', action: undefined as (() => void) | undefined },
    { icon: Question, label: 'Help & Support', id: 'menu-help', action: undefined as (() => void) | undefined },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF5] border-b border-[#D4AF37]/30 shadow-xs">
      {/* Top Ribbon */}
      <div className="bg-[#8B5A2B] text-[#FFFDF5] text-[10px] sm:text-xs font-serif tracking-[0.15em] sm:tracking-[0.2em] py-1.5 px-3 sm:px-4 text-center border-b border-[#724923] flex items-center justify-center gap-1.5 sm:gap-2">
        <Sparkle weight="fill" className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] animate-pulse shrink-0" />
        <span className="truncate">
          HANDCRAFTED IN JAIPUR &nbsp;|&nbsp; SPECIAL PACKAGING &amp; SHIPPING WORLDWIDE
        </span>
        <Sparkle weight="fill" className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] animate-pulse shrink-0 hidden sm:inline" />
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">

          {/* Left: Mobile Hamburger Toggle & Compact Text-Based Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-[#5C5248] hover:text-[#8B5A2B] hover:bg-[#F5F2ED] rounded-md transition-colors focus:outline-none"
              aria-label="Open navigation drawer"
            >
              <List className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Compact Text-Based Brand Logo (No circular badge) */}
            <button
              onClick={() => onNavigate('home')}
              className="flex flex-col text-left group focus:outline-none select-none transition-transform active:scale-[0.98]"
            >
              <span className="font-serif text-[17px] sm:text-lg lg:text-xl font-bold tracking-tight text-[#8B5A2B] group-hover:text-[#724923] transition-colors leading-none whitespace-nowrap">
                Siya Ram Arts
              </span>
              <span className="text-[7.5px] sm:text-[8.5px] uppercase tracking-[0.24em] text-[#A67C52] font-semibold leading-none mt-1 whitespace-nowrap">
                Jaipur Studio
              </span>
            </button>
          </div>

          {/* Center: Desktop Nav Links (Collections, Deities, Custom Idol, Contact Us, About Us) */}
          <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 text-xs uppercase tracking-[0.16em] font-medium text-[#2D2D2D]/90">
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('collections');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={cn(
                'hover:text-[#8B5A2B] transition-colors py-1 relative whitespace-nowrap',
                currentView === 'home' && 'text-[#8B5A2B] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#8B5A2B]'
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
              className="hover:text-[#8B5A2B] transition-colors py-1 whitespace-nowrap"
            >
              Deities
            </button>
            <button
              onClick={onOpenCustomIdol}
              className="hover:text-[#8B5A2B] transition-colors py-1 flex items-center gap-1 font-semibold whitespace-nowrap"
            >
              <span>Custom Idol</span>
            </button>
            <a
              href="https://wa.me/919876286046?text=Namaste%20Siya%20Ram%20Arts!%20%F0%9F%99%8F%0AI%20would%20like%20to%20inquire%20about%20your%20handcrafted%20sacred%20murtis%20and%20temple%20vigrahas."
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#25D366] text-[#2E7D32] transition-colors py-1 font-semibold whitespace-nowrap"
            >
              Contact Us
            </a>
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('about-us');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#8B5A2B] transition-colors py-1 text-[#5C5248] whitespace-nowrap"
            >
              About Us
            </button>
          </nav>

          {/* Right Actions: Search bar, Wishlist, Shopping Bag, User Profile / Login */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-2.5 shrink-0">
            {/* Desktop Search Bar */}
            <div className="relative hidden md:block w-36 lg:w-44 xl:w-52">
              <input
                type="text"
                placeholder="Search murtis..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F5F2ED] border border-[#D4AF37]/30 rounded-full focus:bg-white focus:border-[#8B5A2B] focus:ring-1 focus:ring-[#8B5A2B] focus:outline-none transition-all placeholder:text-[#8C8276] text-[#2D2D2D]"
              />
              <MagnifyingGlass className="w-3.5 h-3.5 text-[#A67C52] absolute left-2.5 top-2 pointer-events-none" />
            </div>

            {/* Wishlist Button */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              aria-label={`Wishlist, ${wishlistCount} items`}
              className="relative p-2 text-[#5C5248] hover:text-[#8B5A2B] hover:bg-[#F5F2ED] rounded-full transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#D4AF37] text-[#2D2D2D] text-[9px] font-bold rounded-full flex items-center justify-center shadow-2xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button
              id="cart-btn"
              onClick={onOpenCart}
              aria-label={`Cart with ${cartCount} items`}
              className="relative p-2 text-[#5C5248] hover:text-[#8B5A2B] hover:bg-[#F5F2ED] rounded-full transition-colors"
              title="My Bag"
            >
              <Bag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-[#8B5A2B] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-2xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Login / User Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#F5F2ED] hover:bg-[#EDE9E1] text-xs font-serif text-[#8B5A2B] transition-colors shadow-2xs"
                >
                  {currentUser.imageUrl ? (
                    <img src={currentUser.imageUrl} alt={currentUser.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                  ) : currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 shrink-0 text-[#8B5A2B]" />
                  ) : (
                    <User className="w-4 h-4 shrink-0 text-[#8B5A2B]" />
                  )}
                  <span className="hidden sm:inline max-w-[75px] truncate font-medium">{currentUser.name}</span>
                  <CaretDown className={cn('w-3 h-3 transition-transform text-[#8B5A2B]', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#D4AF37]/30 rounded-md shadow-xl z-50 overflow-hidden animate-[fadeInUp_0.15s_ease]">
                      <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#D4AF37]/20">
                        <p className="text-xs font-bold text-[#3A2D20] font-serif">{currentUser.name}</p>
                        <p className="text-[10px] text-[#8C7A6A] mt-0.5 font-sans">
                          {currentUser.role === 'admin' ? '⚙️ Admin Account' : '👤 Customer Account'}
                        </p>
                      </div>

                      <div className="py-1">
                        {currentUser.role === 'admin' && (
                          <button
                            id="menu-admin-dashboard"
                            onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-serif text-[#8B5A2B] hover:bg-[#FDF6E9] flex items-center gap-2.5 font-semibold"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Admin Dashboard
                          </button>
                        )}
                        {currentUser.role === 'admin' && <div className="my-1 border-t border-[#D4AF37]/15" />}

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
                            <item.icon className="w-4 h-4 text-[#A67C52]" />
                            {item.label}
                          </button>
                        ))}

                        <div className="my-1 border-t border-[#D4AF37]/15" />

                        <button
                          id="menu-sign-out"
                          onClick={() => { onLogout(); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-serif text-[#C0392B] hover:bg-[#FFF5F5] flex items-center gap-2.5 transition-colors font-medium"
                        >
                          <SignOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : !clerkLoaded ? (
              <div className="w-16 sm:w-20 h-8 rounded-full bg-[#E8DDD0] animate-pulse" />
            ) : (
              <button
                id="login-btn"
                onClick={onLoginClick}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#8B5A2B] hover:bg-[#724923] text-white text-xs font-serif font-semibold tracking-wide transition-colors shadow-2xs whitespace-nowrap"
              >
                <SignIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (Directly below header on small screens) */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search handcrafted murtis..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F5F2ED] border border-[#D4AF37]/35 rounded-md focus:bg-white focus:border-[#8B5A2B] focus:ring-1 focus:ring-[#8B5A2B] focus:outline-none transition-all placeholder:text-[#8C8276] text-[#2D2D2D]"
            />
            <MagnifyingGlass className="w-4 h-4 text-[#A67C52] absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer (Modern slide-over layout) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#1C1410]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[82%] max-w-sm bg-[#FFFDF5] h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-r border-[#D4AF37]/30 z-10 animate-[slideInLeft_0.2s_ease]">
            {/* Drawer Header */}
            <div>
              <div className="p-4 bg-[#FAF7F2] border-b border-[#D4AF37]/20 flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="font-serif text-base font-bold text-[#8B5A2B] leading-tight whitespace-nowrap">
                    Siya Ram Arts
                  </span>
                  <span className="text-[7.5px] uppercase tracking-[0.22em] text-[#A67C52] font-semibold mt-0.5 whitespace-nowrap">
                    Jaipur Studio
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#5C5248] hover:text-[#8B5A2B] rounded-md hover:bg-[#F5F2ED]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-1.5">
                <p className="text-[10px] uppercase font-serif tracking-widest text-[#A67C52] font-bold px-3 py-1">
                  Navigation
                </p>

                <button
                  onClick={() => {
                    onNavigate('home');
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-md text-sm font-serif flex items-center justify-between transition-colors',
                    currentView === 'home'
                      ? 'bg-[#8B5A2B] text-white font-bold shadow-2xs'
                      : 'text-[#3A2D20] hover:bg-[#F5F2ED]'
                  )}
                >
                  <span>Home</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('home');
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm font-serif text-[#3A2D20] hover:bg-[#F5F2ED] transition-colors flex items-center justify-between"
                >
                  <span>Sacred Collections</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('home');
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('deities')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm font-serif text-[#3A2D20] hover:bg-[#F5F2ED] transition-colors flex items-center justify-between"
                >
                  <span>Deities Catalog</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('home');
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm font-serif text-[#3A2D20] hover:bg-[#F5F2ED] transition-colors flex items-center justify-between"
                >
                  <span>Atelier Lineage (About Us)</span>
                </button>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCustomIdol?.();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-md bg-[#F5F2ED] border border-[#D4AF37]/40 text-[#8B5A2B] hover:bg-[#8B5A2B] hover:text-white transition-all flex items-center gap-2 font-serif font-bold text-xs"
                  >
                    <Sparkle weight="fill" className="w-4 h-4 text-[#D4AF37]" />
                    <span>Request Custom Murti</span>
                  </button>
                </div>
              </div>

              {/* Quick Customer Tools */}
              <div className="p-4 border-t border-[#D4AF37]/20 space-y-1">
                <p className="text-[10px] uppercase font-serif tracking-widest text-[#A67C52] font-bold px-3 py-1">
                  Customer Care &amp; Tracking
                </p>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTrackOrder();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-serif text-[#3A2D20] hover:bg-[#F5F2ED] flex items-center gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-[#A67C52]" />
                  <span>Track Sanctum Order</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWishlist();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-serif text-[#3A2D20] hover:bg-[#F5F2ED] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#A67C52]" />
                    <span>My Wishlist</span>
                  </span>
                  {wishlistCount > 0 && (
                    <span className="px-2 py-0.5 bg-[#D4AF37] text-[#2D2D2D] rounded-full text-[10px] font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <a
                  href="https://wa.me/919876286046?text=Namaste%20Siya%20Ram%20Arts!%20%F0%9F%99%8F%0AI%20would%20like%20to%20inquire%20about%20your%20handcrafted%20sacred%20murtis%20and%20temple%20vigrahas."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-serif text-[#2E7D32] hover:bg-[#E8F5E9] flex items-center gap-2.5 font-semibold"
                >
                  <span>💬 WhatsApp Atelier Help</span>
                </a>
              </div>
            </div>

            {/* Drawer Footer: User Profile / Login */}
            <div className="p-4 bg-[#FAF7F2] border-t border-[#D4AF37]/20">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    {currentUser.imageUrl ? (
                      <img src={currentUser.imageUrl} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center text-xs font-bold font-serif">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#3A2D20] font-serif truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-[#8C7A6A] font-sans">
                        {currentUser.role === 'admin' ? 'Atelier Admin' : 'Devotee Account'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-md bg-[#FFFDF5] border border-[#C0392B]/30 text-[#C0392B] hover:bg-[#FFF5F5] text-xs font-serif font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <SignOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="w-full py-2.5 px-4 rounded-md bg-[#8B5A2B] hover:bg-[#724923] text-white text-xs font-serif font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <SignIn className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
