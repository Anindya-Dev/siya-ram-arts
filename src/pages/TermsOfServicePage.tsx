import React from 'react';

interface TermsOfServicePageProps {
  onNavigate?: (page: string) => void;
}

export function TermsOfServicePage({ onNavigate }: TermsOfServicePageProps) {
  const lastUpdated = 'September 14, 2026';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241F1C]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10 border-b border-[#D4AF37]/30 pb-8">
          <p className="text-xs font-sans tracking-[0.2em] uppercase text-[#8B5A2B] mb-2">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-[#3A2D20] mb-3">Terms of Service</h1>
          <p className="text-sm text-[#7A6A5A] font-serif">
            Last updated: <span className="text-[#8B5A2B]">{lastUpdated}</span>
          </p>
        </div>

        <div className="prose prose-stone max-w-none font-serif text-[#3A2D20] space-y-8 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or placing an order through <strong>Siya Ram Arts</strong> (siyaramarts.com),
              you agree to be bound by these Terms of Service and all applicable Indian laws. If you
              disagree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">2. Products &amp; Authenticity</h2>
            <p>
              All murtis and sacred sculptures sold by Siya Ram Arts are handcrafted by certified
              artisans at our Jaipur Atelier and Kashi Sanctum Studio. Every product is accompanied by
              a certificate of authenticity bearing a unique <em>SRA-CERT</em> number. Specifications
              (weight, dimensions, finish) are indicative and may vary slightly due to the handcrafted
              nature of each idol.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">3. Pricing &amp; Payment</h2>
            <p>
              All prices are in Indian Rupees (₹) and include applicable GST where stated. We accept
              payments via UPI, credit/debit cards, net banking, and EMI options facilitated through
              Razorpay. Full payment is required before dispatch unless a custom order agreement states
              otherwise.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">4. Order Fulfilment</h2>
            <p>
              Standard orders are dispatched within 3–7 business days. Custom-commission orders have
              a craftsmanship timeline of 12–35 days as communicated during ordering. Dispatch is
              handled through Shiprocket-partnered couriers (DTDC, Delhivery, BlueDart). You will
              receive an SMS + email with tracking information upon dispatch.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">5. Intellectual Property</h2>
            <p>
              All photographs, product names, descriptions, and design marks on this website are the
              exclusive intellectual property of Siya Ram Arts. Reproduction, redistribution, or use
              without written consent is prohibited.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">6. Limitation of Liability</h2>
            <p>
              Siya Ram Arts shall not be liable for indirect, incidental, or consequential damages.
              Our total liability for any claim arising out of a purchase shall not exceed the invoice
              value of the disputed order.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">7. Governing Law</h2>
            <p>
              These Terms are governed by the laws of India. Any disputes shall be subject to the
              exclusive jurisdiction of the courts at <strong>Jaipur, Rajasthan</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">8. Contact</h2>
            <p>
              For any queries regarding these Terms, write to us at{' '}
              <a
                href="mailto:support@siyaramarts.com"
                className="text-[#8B5A2B] hover:text-[#5B3917] underline"
              >
                support@siyaramarts.com
              </a>{' '}
              or call <strong>+91 98290 12345</strong>.
            </p>
          </section>
        </div>

        {/* Back button */}
        <div className="mt-12 pt-8 border-t border-[#D4AF37]/30">
          <button
            id="btn-back-from-terms"
            onClick={() => onNavigate?.('home')}
            className="text-sm font-serif text-[#8B5A2B] hover:text-[#5B3917] transition-colors underline"
          >
            ← Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
