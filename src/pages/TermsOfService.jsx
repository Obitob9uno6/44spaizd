import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground tracking-wider hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="w-3 h-3" /> BACK
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">TERMS OF SERVICE</h1>
          <p className="text-[10px] text-muted-foreground mt-2 tracking-wider">Last updated: April 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-muted-foreground leading-relaxed">
        <Section title="1. ACCEPTANCE OF TERMS">
          By accessing and using the SPAIZD website, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our site.
        </Section>
        <Section title="2. PRODUCTS & PRICING">
          All prices are listed in USD. We reserve the right to modify prices at any time. Product descriptions and images are as accurate as possible, but we do not warrant that they are error-free.
        </Section>
        <Section title="3. ORDERS & PAYMENT">
          By placing an order, you represent that you are authorized to use the payment method provided. We reserve the right to refuse or cancel any order at our discretion.
        </Section>
        <Section title="4. SHIPPING">
          We ship within the United States. Free shipping is available on orders over $150. Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery to the carrier.
        </Section>
        <Section title="5. RETURNS & EXCHANGES">
          We accept returns of unworn, unwashed items in original condition within 30 days of delivery. Sale items are final sale. Contact us at hello@spaizd.com to initiate a return.
        </Section>
        <Section title="6. INTELLECTUAL PROPERTY">
          All content on this site — including text, graphics, logos, and images — is the property of SPAIZD and may not be reproduced without written permission.
        </Section>
        <Section title="7. LIMITATION OF LIABILITY">
          SPAIZD shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products.
        </Section>
        <Section title="8. CONTACT">
          For questions regarding these Terms, contact us at hello@spaizd.com.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xs font-bold tracking-widest text-foreground mb-2">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
