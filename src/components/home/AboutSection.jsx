import { Link } from 'react-router-dom';

export default function AboutSection() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          About <span className="text-primary">SPAIZD</span>
        </h2>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-base sm:text-lg">
            SPAIZD is a California-born streetwear brand dedicated to creating premium, 
            sustainable clothing that embodies the laid-back West Coast lifestyle. We believe 
            in slow fashion - thoughtfully designed pieces that stand the test of time.
          </p>
          
          <p className="text-base sm:text-lg">
            Our collections feature sun-soaked fabrics, authentic designs, and a commitment 
            to quality over quantity. Every piece is crafted with care, ensuring you look 
            good while feeling good about your choices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="font-bold text-foreground mb-2">Premium Quality</h3>
              <p className="text-sm">Carefully selected materials for lasting comfort and style</p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <h3 className="font-bold text-foreground mb-2">Sustainable Fashion</h3>
              <p className="text-sm">Eco-conscious production with minimal environmental impact</p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <h3 className="font-bold text-foreground mb-2">Cali Culture</h3>
              <p className="text-sm">Authentic West Coast vibes in every design</p>
            </div>
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
