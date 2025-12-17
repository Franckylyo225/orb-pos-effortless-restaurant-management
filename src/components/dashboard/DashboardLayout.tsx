import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  LayoutGrid,
  UtensilsCrossed,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ChefHat,
  History,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { RestaurantSwitcher } from "./RestaurantSwitcher";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard" },
  { icon: ShoppingBag, label: "Caisse (POS)", href: "/dashboard/pos" },
  { icon: ChefHat, label: "Cuisine", href: "/dashboard/kitchen" },
  { icon: History, label: "Historique", href: "/dashboard/orders" },
  { icon: LayoutGrid, label: "Tables", href: "/dashboard/tables" },
  { icon: UtensilsCrossed, label: "Menu", href: "/dashboard/menu" },
  { icon: Package, label: "Stock", href: "/dashboard/stock" },
  { icon: Users, label: "Équipe", href: "/dashboard/team" },
  { icon: BarChart3, label: "Rapports", href: "/dashboard/reports" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { restaurant, profile, loading: restaurantLoading } = useRestaurant();
  const { isTrialing, trialDaysRemaining, isTrialExpired } = useSubscription();
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Redirect to register if no restaurant (user needs to complete registration)
  useEffect(() => {
    if (!authLoading && !restaurantLoading && user && !restaurant) {
      navigate("/register");
    }
  }, [user, authLoading, restaurantLoading, restaurant, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/");
  };

  if (authLoading || restaurantLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !restaurant) {
    return null;
  }

  const showTrialBanner = isTrialing && !isTrialExpired && trialDaysRemaining <= 7;
  const showExpiredBanner = isTrialing && isTrialExpired;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 md:h-20 flex items-center justify-between px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            {!collapsed && (
              <span className="font-display font-bold text-lg">ORBI POS</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-8 h-8 rounded-lg bg-muted items-center justify-center hover:bg-muted/80 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={22} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Restaurant Switcher & Logout */}
        <div className="p-3 border-t border-border space-y-2">
          <RestaurantSwitcher collapsed={collapsed} />
          {!collapsed && (
            <Link
              to="/dashboard/subscription"
              className="block px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CreditCard size={12} />
                <span>
                  {isTrialing && !isTrialExpired ? (
                    <span className="flex items-center gap-1">
                      Essai Pro
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {trialDaysRemaining}j
                      </Badge>
                    </span>
                  ) : restaurant?.subscription_plan === "premium" ? (
                    "Plan Premium"
                  ) : restaurant?.subscription_plan === "pro" ? (
                    "Plan Pro"
                  ) : (
                    "Plan Basic"
                  )}
                </span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-destructive",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-3">Déconnexion</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 flex flex-col",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Trial Expiring Banner */}
        {showTrialBanner && (
          <div className="bg-warning/10 border-b border-warning/20 px-4 py-3">
            <div className="flex items-center justify-between max-w-screen-xl mx-auto">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning" />
                <p className="text-sm">
                  <span className="font-medium">Votre essai gratuit expire dans {trialDaysRemaining} jour{trialDaysRemaining > 1 ? "s" : ""}.</span>
                  {" "}Passez à un plan payant pour continuer à profiter de toutes les fonctionnalités.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/dashboard/subscription")}
              >
                Voir les offres
              </Button>
            </div>
          </div>
        )}

        {/* Trial Expired Banner */}
        {showExpiredBanner && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
            <div className="flex items-center justify-between max-w-screen-xl mx-auto">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-sm">
                  <span className="font-medium">Votre essai gratuit est terminé.</span>
                  {" "}Certaines fonctionnalités sont maintenant limitées. Souscrivez à un abonnement pour les débloquer.
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => navigate("/dashboard/subscription")}
              >
                S'abonner maintenant
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
