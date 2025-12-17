import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import UseCasesPage from "./pages/UseCasesPage";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Kitchen from "./pages/Kitchen";
import Tables from "./pages/Tables";
import Menu from "./pages/Menu";
import Stock from "./pages/Stock";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import Onboarding from "./pages/Onboarding";
import OrderHistory from "./pages/OrderHistory";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import PublicMenu from "./pages/PublicMenu";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Handle SPA redirects from 404.html
function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (redirect && location.pathname === '/') {
      navigate(redirect, { replace: true });
    }
  }, [location, navigate]);
  
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RedirectHandler />
        <AuthProvider>
          <AdminAuthProvider>
            <Routes>
              {/* Public Menu Route - No auth required */}
              <Route path="/menu/:restaurantId" element={<PublicMenu />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminAnalytics />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin/restaurants" element={<AdminRestaurants />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
              <Route path="/admin/marketing" element={<AdminMarketing />} />
              <Route path="/admin/admins" element={<AdminAdmins />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/use-cases" element={<UseCasesPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/pos" element={<POS />} />
              <Route path="/dashboard/kitchen" element={<Kitchen />} />
              <Route path="/dashboard/tables" element={<Tables />} />
              <Route path="/dashboard/menu" element={<Menu />} />
              <Route path="/dashboard/stock" element={<Stock />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/subscription" element={<Subscription />} />
              <Route path="/dashboard/subscription/success" element={<PaymentSuccess />} />
              <Route path="/dashboard/orders" element={<OrderHistory />} />
              <Route path="/dashboard/reports" element={<Reports />} />
              <Route path="/dashboard/team" element={<Team />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
