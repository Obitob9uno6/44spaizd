import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const DEFAULT_ABOUT = {
  title: 'ABOUT SPAIZD',
  description: 'SPAIZD is a California-born streetwear brand dedicated to creating premium, sustainable clothing that embodies the laid-back West Coast lifestyle.',
  features: [
    { title: 'PREMIUM QUALITY', description: 'Carefully selected materials for lasting comfort and style' },
    { title: 'SUSTAINABLE FASHION', description: 'Eco-conscious production with minimal environmental impact' },
    { title: 'CALI CULTURE', description: 'Authentic West Coast vibes in every design' },
  ],
};

export default function AboutSection() {
  const [aboutContent, setAboutContent] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    const loadAboutContent = async () => {
      try {
        const res = await fetch('/api/content/about');
        if (res.ok) {
          const data = await res.json();
          if (data.data && Object.keys(data.data).length > 0) {
            setAboutContent(data.data);
          }
        }
      } catch (err) {
        console.warn('[v0] Failed to load about content:', err);
      }
    };
    loadAboutContent();
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          {aboutContent.title}
        </h2>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-base sm:text-lg">
            {aboutContent.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            {aboutContent.features.map((feature, idx) => (
              <div key={idx} className="p-6 border border-border rounded-lg">
                <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <Link
              to="/about"
              className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium tracking-wide transition-colors"
            >
              Learn more about our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
