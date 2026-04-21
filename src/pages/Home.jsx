import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import FeaturedCollection from '../components/home/FeaturedCollection';
import VIPPromo from '../components/home/VIPPromo';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <FeaturedCollection />
      <VIPPromo />
      <Newsletter />
    </div>
  );
}
