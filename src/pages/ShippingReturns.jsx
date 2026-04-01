import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function ShippingReturns() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground tracking-wider hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="w-3 h-3" /> BACK
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">SHIPPING & RETURNS</h1>
          <p className="text-[10px] text-muted-foreground mt-2 tracking-wider">Last updated: April 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-muted-foreground leading-relaxed">
        <Section title="SHIPPING RATES">
          Standard shipping is $12 on all orders. Orders over $150 qualify for free standard shipping. Expedited options are not currently available.
        </Section>
        <Section title="PROCESSING TIME">
          Orders are processed within 1–3 business days. You will receive a confirmation email once your order has shipped.
        </Section>
        <Section title="DELIVERY ESTIMATES">
          Standard shipping typically takes 5–10 business days within the continental US. Delivery times are estimates and not guaranteed.
        </Section>
        <Section title="RETURNS">
          We accept returns on unworn, unwashed items in original condition within 30 days of delivery. Items must have all tags attached and be in original packaging where applicable.
        </Section>
        <Section title="EXCHANGES">
          We do not currently offer direct exchanges. Please return your item for a refund and place a new order for the desired product.
        </Section>
        <Section title="SALE ITEMS">
          All sale items are final sale and are not eligible for return or exchange.
        </Section>
        <Section title="HOW TO RETURN">
          To initiate a return, email us at hello@spaizd.com with your order details. We will provide a return shipping label within 2 business days.
        </Section>
        <Section title="REFUNDS">
          Once your return is received and inspected, we will issue a refund to your original payment method within 5–7 business days.
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
