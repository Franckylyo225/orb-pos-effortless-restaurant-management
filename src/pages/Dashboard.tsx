import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurant";

const stats = [
  {
    label: "Ventes du jour",
    value: "245 000",
    unit: "CFA",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Commandes",
    value: "47",
    unit: "",
    change: "+8%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    label: "Clients servis",
    value: "132",
    unit: "",
    change: "-3%",
    trend: "down",
    icon: Users,
  },
  {
    label: "Ticket moyen",
    value: "18 500",
    unit: "CFA",
    change: "+5%",
    trend: "up",
    icon: TrendingUp,
  },
];

const recentOrders = [
  { id: "#1247", table: "Table 5", items: 4, total: "32 500", status: "En cuisine", time: "Il y a 5 min" },
  { id: "#1246", table: "Table 12", items: 2, total: "18 000", status: "Servi", time: "Il y a 12 min" },
  { id: "#1245", table: "Table 3", items: 6, total: "54 200", status: "Payé", time: "Il y a 18 min" },
  { id: "#1244", table: "Comptoir", items: 1, total: "8 500", status: "Payé", time: "Il y a 25 min" },
];

const stockAlerts = [
  { product: "Huile de palme", current: 2, unit: "L", threshold: 5 },
  { product: "Poulet", current: 3, unit: "kg", threshold: 10 },
  { product: "Riz", current: 5, unit: "kg", threshold: 15 },
];

const topProducts = [
  { name: "Poulet braisé", sales: 45, revenue: "292 500" },
  { name: "Attieke poisson", sales: 38, revenue: "228 000" },
  { name: "Alloco", sales: 32, revenue: "96 000" },
  { name: "Jus de bissap", sales: 28, revenue: "42 000" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, restaurant } = useRestaurant();

  const displayName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
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
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card hover:shadow-medium transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <stat.icon size={24} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {stat.change}
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
                <Link to="/dashboard/orders" className="gap-1">
                  Voir tout <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-medium text-sm">
                      {order.table.replace("Table ", "T")}
                    </div>
                    <div>
                      <p className="font-medium">
                        {order.id} — {order.table}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.items} articles • {order.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.total} CFA</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "En cuisine"
                          ? "bg-warning/20 text-warning"
                          : order.status === "Servi"
                          ? "bg-primary/20 text-primary"
                          : "bg-success/20 text-success"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
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
                    {stockAlerts.length} produits faibles
                  </p>
                </div>
              </div>
              <div className="divide-y divide-border">
                {stockAlerts.map((alert) => (
                  <div
                    key={alert.product}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{alert.product}</p>
                      <p className="text-sm text-muted-foreground">
                        Seuil: {alert.threshold} {alert.unit}
                      </p>
                    </div>
                    <span className="text-destructive font-semibold">
                      {alert.current} {alert.unit}
                    </span>
                  </div>
                ))}
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
                {topProducts.map((product, index) => (
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
                          {product.sales} vendus
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">{product.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
