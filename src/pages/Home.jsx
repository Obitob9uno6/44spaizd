import HeroSection from '../components/home/HeroSection';
import FeaturedCollection from '../components/home/FeaturedCollection';
import VIPPromo from '../components/home/VIPPromo';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedCollection />
      <VIPPromo />
      <Newsletter />
    </div>
  );
}
