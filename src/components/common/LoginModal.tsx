import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { X, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Sign In"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1C1410]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-[#FFFDF5] rounded-sm shadow-2xl border border-[#D4AF37]/30 overflow-hidden animate-[fadeInUp_0.25s_ease]">

        {/* Header */}
        <div className="bg-[#8B5A2B] px-6 pt-6 pb-5 relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-serif">
              Siya Ram Arts
            </span>
          </div>
          <h2 className="font-serif text-2xl text-white font-bold leading-tight">
            Welcome Back
          </h2>
          <p className="text-[#D5C2A8] text-xs mt-0.5">
            Sign in to your account to continue
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#D5C2A8] hover:text-white hover:bg-[#724923] rounded-sm transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clerk SignIn — single unified login for everyone */}
        <div className="flex justify-center px-4 py-6">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0 bg-transparent p-0 w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'border border-[#D4AF37]/40 text-[#2D2D2D] hover:bg-[#F5F2ED] font-serif text-sm rounded-sm',
                formButtonPrimary:
                  'bg-[#8B5A2B] hover:bg-[#724923] text-white font-serif text-sm rounded-sm',
                formFieldInput:
                  'border-[#D4AF37]/40 bg-[#FAF7F2] focus:border-[#8B5A2B] rounded-sm text-sm',
                formFieldLabel:
                  'text-[#5C4828] font-serif text-xs uppercase tracking-wide',
                footerActionLink:
                  'text-[#8B5A2B] hover:text-[#724923] font-serif',
                dividerLine: 'bg-[#D4AF37]/20',
                dividerText: 'text-[#A09080] font-serif text-xs',
                identityPreviewText: 'font-serif text-sm text-[#2D2D2D]',
                identityPreviewEditButton: 'text-[#8B5A2B] font-serif text-xs',
              },
            }}
            routing="virtual"
          />
        </div>

        {/* Small note at bottom */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[10px] text-[#B0A090] font-serif">
            Admin access is automatically assigned by the site owner.
            <br />You do not need a separate login.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
