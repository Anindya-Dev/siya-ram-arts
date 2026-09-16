import React from 'react';

interface ReturnsPolicyPageProps {
  onNavigate?: (page: string) => void;
}

export function ReturnsPolicyPage({ onNavigate }: ReturnsPolicyPageProps) {
  const lastUpdated = 'September 14, 2026';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241F1C]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10 border-b border-[#D4AF37]/30 pb-8">
          <p className="text-xs font-sans tracking-[0.2em] uppercase text-[#8B5A2B] mb-2">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-[#3A2D20] mb-3">Returns &amp; Refund Policy</h1>
          <p className="text-sm text-[#7A6A5A] font-serif">
            Last updated: <span className="text-[#8B5A2B]">{lastUpdated}</span>
          </p>
        </div>

        <div className="prose prose-stone max-w-none font-serif text-[#3A2D20] space-y-8 leading-relaxed">

          <section>
            <div className="bg-[#FDF6E9] border border-[#D4AF37]/40 rounded-sm px-5 py-4 mb-4">
              <p className="text-sm font-serif text-[#5B3917]">
                <strong>Our Promise:</strong> Every idol is packed with sacred care and shipped
                securely. If your murti arrives damaged or is not as described, we will make it right.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">1. Eligibility for Returns</h2>
            <p>You may request a return within <strong>7 days</strong> of delivery if:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
              <li>The product was delivered damaged (transit damage).</li>
              <li>The product received is materially different from what was ordered (wrong item, wrong size).</li>
              <li>The product has a confirmed manufacturing defect.</li>
            </ul>
            <p className="mt-3">
              <strong>Returns are NOT accepted</strong> for change-of-mind, minor colour variations
              (inherent to hand-painting), or products that have been consecrated (Prana Pratishtha performed).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">2. Custom Orders</h2>
            <p>
              Custom commission murtis (custom-carved or custom-painted) are <strong>non-returnable</strong>{' '}
              and <strong>non-refundable</strong> once craftsmanship has begun. The 30% advance
              deposit is non-refundable after the Artisan Confirmation email is sent. Balance payment
              refunds are assessed case-by-case if a defect is found before dispatch.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">3. How to Initiate a Return</h2>
            <ol className="list-decimal pl-6 space-y-2 text-sm mt-2">
              <li>
                Email <a href="mailto:returns@siyaramarts.com" className="text-[#8B5A2B] underline">returns@siyaramarts.com</a>{' '}
                within 7 days of delivery with your Order ID and photos of the packaging and product.
              </li>
              <li>Our team reviews the claim within <strong>2 business days</strong>.</li>
              <li>If approved, we arrange reverse pickup via Shiprocket at no cost to you.</li>
              <li>Once the item is received and inspected at our atelier, the refund is processed.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">4. Refund Timeline</h2>
            <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
              <li>
                <strong>Online payments (Razorpay):</strong> Refunded to original payment instrument within
                5–7 business days of inspection approval.
              </li>
              <li>
                <strong>Bank transfer (NEFT/RTGS):</strong> Processed within 7–10 business days.
              </li>
              <li>
                <strong>Replacement:</strong> If you prefer a replacement murti, it will be dispatched
                within 5–10 business days after the returned item is received.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">5. Cancellations</h2>
            <p>
              Orders can be cancelled free of charge before the <em>Dispatched</em> status is
              reached. Once an order enters the <em>Dispatched</em> state, a cancellation is treated
              as a return under Section 3.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">6. Dispute Resolution</h2>
            <p>
              Unresolved disputes may be escalated to our senior management at{' '}
              <a href="mailto:support@siyaramarts.com" className="text-[#8B5A2B] underline">
                support@siyaramarts.com
              </a>
              . All disputes are subject to the jurisdiction of Jaipur courts.
            </p>
          </section>
        </div>

        {/* Back button */}
        <div className="mt-12 pt-8 border-t border-[#D4AF37]/30">
          <button
            id="btn-back-from-returns"
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
