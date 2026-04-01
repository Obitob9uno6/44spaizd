import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SmokeOverlay from './SmokeOverlay';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import CartPanel from './CartPanel';
import AgeGate from './AgeGate';

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AgeGate />
      <AnnouncementBar />
      <SmokeOverlay />
      <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
        <div className="scanner-line absolute left-0 right-0 h-px bg-primary/20" />
      </div>

      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartPanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
