import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowRight,
  Loader2,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-muted text-muted-foreground" },
  in_kitchen: { label: "En cuisine", className: "bg-warning/20 text-warning" },
  ready: { label: "Prêt", className: "bg-primary/20 text-primary" },
  served: { label: "Servi", className: "bg-primary/20 text-primary" },
  paid: { label: "Payé", className: "bg-success/20 text-success" },
  cancelled: { label: "Annulé", className: "bg-destructive/20 text-destructive" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, restaurant } = useRestaurant();
  const { stats, recentOrders, stockAlerts, topProducts, loading, isOfflineData } = useDashboardStats();

  const displayName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Utilisateur";

  const statsCards = [
    {
      label: "Ventes du jour",
      value: stats.todayRevenue.toLocaleString(),
      unit: "CFA",
      icon: DollarSign,
    },
    {
      label: "Commandes",
      value: stats.todayOrders.toString(),
      unit: "",
      icon: ShoppingCart,
    },
    {
      label: "Clients servis",
      value: stats.todayCustomers.toString(),
      unit: "",
      icon: Users,
    },
    {
      label: "Ticket moyen",
      value: stats.averageTicket.toLocaleString(),
      unit: "CFA",
      icon: TrendingUp,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Offline Mode Banner */}
        {isOfflineData && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">Mode hors-ligne</p>
              <p className="text-xs text-muted-foreground">
                Les données affichées proviennent du cache local. Elles seront synchronisées dès que la connexion sera rétablie.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Bonjour, {displayName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Voici un aperçu de {restaurant?.name || "votre restaurant"} aujourd'hui.
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/dashboard/pos" className="gap-2">
              <ShoppingCart size={20} />
              Ouvrir la caisse
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="stat-card hover:shadow-medium transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <stat.icon size={24} />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">
                {stat.value}
                {stat.unit && (
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    {stat.unit}
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg">
                Commandes récentes
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/pos" className="gap-1">
                  Voir tout <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune commande aujourd'hui</p>
                </div>
              ) : (
                recentOrders.map((order) => {
                  const statusInfo = statusLabels[order.status] || statusLabels.pending;
                  return (
                    <div
                      key={order.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-medium text-sm">
                          {order.table_name.replace("Table ", "T").slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-medium">
                            #{order.order_number} — {order.table_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items_count} articles •{" "}
                            {formatDistanceToNow(new Date(order.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.total.toLocaleString()} CFA</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Stock Alerts */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
              <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="font-display font-semibold">Alertes stock</h2>
                  <p className="text-sm text-muted-foreground">
                    {stockAlerts.length} produit(s) faible(s)
                  </p>
                </div>
              </div>
              <div className="divide-y divide-border">
                {stockAlerts.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Aucune alerte stock
                  </div>
                ) : (
                  stockAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{alert.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Seuil: {alert.min_stock_threshold} {alert.unit}
                        </p>
                      </div>
                      <span className="text-destructive font-semibold">
                        {alert.current_stock} {alert.unit}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-muted/30">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard/stock">Gérer le stock</Link>
                </Button>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-display font-semibold">
                  Meilleures ventes
                </h2>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
              </div>
              <div className="divide-y divide-border">
                {topProducts.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Aucune vente aujourd'hui
                  </div>
                ) : (
                  topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} vendus
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">{product.revenue.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
