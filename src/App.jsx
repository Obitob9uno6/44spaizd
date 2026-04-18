import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import VIP from './pages/VIP';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminDrops from './pages/admin/AdminDrops';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSubscribers from './pages/admin/AdminSubscribers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStoreSettings from './pages/admin/AdminStoreSettings';
import AdminContent from './pages/admin/AdminContent';
import AdminImages from './pages/admin/AdminImages';
import OrderLookup from './pages/OrderLookup';
import AccountOrders from './pages/AccountOrders';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ShippingReturns from './pages/ShippingReturns';
import Wishlist from './pages/Wishlist';
import Drops from './pages/Drops';
import About from './pages/About';
import Connect from './pages/Connect';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/vip" element={<VIP />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/shipping" element={<ShippingReturns />} />
        <Route path="/order-lookup" element={<OrderLookup />} />
        <Route path="/account/orders" element={<AccountOrders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/drops" element={<Drops />} />
        <Route path="/about" element={<About />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="drops" element={<AdminDrops />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="subscribers" element={<AdminSubscribers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="promo-codes" element={<AdminPromoCodes />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="images" element={<AdminImages />} />
        <Route path="settings" element={<AdminStoreSettings />} />
      </Route>
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
