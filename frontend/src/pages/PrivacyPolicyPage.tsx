import React from 'react';

interface PrivacyPolicyPageProps {
  onNavigate?: (page: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  const lastUpdated = 'September 14, 2026';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241F1C]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10 border-b border-[#D4AF37]/30 pb-8">
          <p className="text-xs font-sans tracking-[0.2em] uppercase text-[#8B5A2B] mb-2">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-[#3A2D20] mb-3">Privacy Policy</h1>
          <p className="text-sm text-[#7A6A5A] font-serif">
            Last updated: <span className="text-[#8B5A2B]">{lastUpdated}</span>
          </p>
        </div>

        <div className="prose prose-stone max-w-none font-serif text-[#3A2D20] space-y-8 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">1. Information We Collect</h2>
            <p>We collect the following categories of information:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
              <li><strong>Account data:</strong> Name, email address, phone number (via Clerk authentication).</li>
              <li><strong>Order data:</strong> Shipping address, order items, payment status (via Razorpay — we do not store card numbers).</li>
              <li><strong>Usage data:</strong> Pages visited, device type, browser, and IP address (for security and analytics).</li>
              <li><strong>Communication data:</strong> WhatsApp messages, emails, or custom order enquiries you send us.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
              <li>To process and fulfil your orders and issue invoices.</li>
              <li>To provide shipment tracking and delivery notifications.</li>
              <li>To respond to custom idol enquiries and consecration service requests.</li>
              <li>To send transactional emails (order confirmation, dispatch updates). We do <em>not</em> send marketing emails without explicit consent.</li>
              <li>To improve website functionality and detect fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">3. Third-Party Services</h2>
            <p>We use the following third-party services. Each has its own privacy policy:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
              <li><strong>Clerk</strong> — Authentication and identity management.</li>
              <li><strong>Razorpay</strong> — Payment processing. Card data never touches our servers.</li>
              <li><strong>Shiprocket</strong> — Logistics and courier fulfilment.</li>
              <li><strong>Supabase</strong> — Secure database and file storage (hosted on AWS ap-south-1).</li>
              <li><strong>Sentry</strong> — Error monitoring (anonymised stack traces only).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">4. Data Retention</h2>
            <p>
              Order records are retained for 7 years as required by Indian GST regulations. Account
              data may be deleted upon written request, subject to legal retention requirements.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">5. Security</h2>
            <p>
              We use industry-standard encryption (TLS 1.3) for all data in transit. Our database
              is hosted on Supabase (Postgres on AWS), which maintains SOC 2 Type 2 compliance.
              Passwords are never stored — we use Clerk's passwordless / OAuth flows.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">6. Your Rights</h2>
            <p>
              Under the Information Technology Act, 2000 and the Digital Personal Data Protection
              Act, 2023 (DPDPA), you have the right to access, correct, and request deletion of
              your personal data. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#3A2D20] mb-3">7. Contact</h2>
            <p>
              For privacy-related requests or concerns, email our Data Officer at{' '}
              <a
                href="mailto:privacy@siyaramarts.com"
                className="text-[#8B5A2B] hover:text-[#5B3917] underline"
              >
                privacy@siyaramarts.com
              </a>
              .
            </p>
          </section>
        </div>

        {/* Back button */}
        <div className="mt-12 pt-8 border-t border-[#D4AF37]/30">
          <button
            id="btn-back-from-privacy"
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
