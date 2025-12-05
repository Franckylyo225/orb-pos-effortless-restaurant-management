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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard" },
  { icon: ShoppingBag, label: "Caisse (POS)", href: "/dashboard/pos" },
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
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

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

  if (!user) {
    return null;
  }

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

        {/* Restaurant Info & Logout */}
        <div className="p-3 border-t border-border space-y-2">
          {!collapsed && (
            <div className="px-3 py-2">
              <p className="font-medium text-sm truncate">
                {restaurant?.name || "Mon Restaurant"}
              </p>
              <p className="text-xs text-muted-foreground">
                {restaurant?.subscription_plan === "premium" ? "Plan Premium" : 
                 restaurant?.subscription_plan === "pro" ? "Plan Pro" : "Plan Basic"}
              </p>
            </div>
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
          "flex-1 transition-all duration-300",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}
