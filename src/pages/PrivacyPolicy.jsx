import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground tracking-wider hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="w-3 h-3" /> BACK
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">PRIVACY POLICY</h1>
          <p className="text-[10px] text-muted-foreground mt-2 tracking-wider">Last updated: April 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-muted-foreground leading-relaxed">
        <Section title="1. INFORMATION WE COLLECT">
          We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you place an order or sign up for our newsletter.
        </Section>
        <Section title="2. HOW WE USE YOUR INFORMATION">
          We use the information we collect to process orders, send order confirmations and updates, respond to your comments and questions, and send promotional communications (if you opt in).
        </Section>
        <Section title="3. SHARING OF INFORMATION">
          We do not sell your personal information. We may share your information with third-party service providers who help us operate our website and fulfill orders (e.g., shipping carriers, payment processors).
        </Section>
        <Section title="4. DATA RETENTION">
          We retain your personal information for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required by law.
        </Section>
        <Section title="5. COOKIES">
          We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser.
        </Section>
        <Section title="6. YOUR RIGHTS">
          You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at privacy@spaizd.com.
        </Section>
        <Section title="7. CONTACT US">
          If you have questions about this Privacy Policy, please contact us at privacy@spaizd.com.
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
