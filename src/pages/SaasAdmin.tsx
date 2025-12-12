import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSaasAdmin } from "@/hooks/useSaasAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  ShoppingCart,
  TrendingUp,
  Crown,
  Zap,
  Star,
  Search,
  Download,
  RefreshCw,
  Loader2,
  ArrowLeft,
  UtensilsCrossed,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function SaasAdmin() {
  const { isSuperAdmin, loading, stats, refetch } = useSaasAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    if (!stats?.allRestaurants) return;

    const csv = [
      ["Nom", "Plan", "Email", "Téléphone", "Équipe", "Commandes", "Plats", "Tables", "CA Total", "Date création"].join(","),
      ...stats.allRestaurants.map(r => [
        `"${r.name}"`,
        r.subscription_plan || "basic",
        r.email || "",
        r.phone || "",
        r.team_size || 1,
        r.total_orders,
        r.total_menu_items,
        r.total_tables,
        r.total_revenue,
        format(new Date(r.created_at), "dd/MM/yyyy"),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `restaurants_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredRestaurants = stats?.allRestaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === "all" || 
      (planFilter === "basic" && (!r.subscription_plan || r.subscription_plan === "basic")) ||
      r.subscription_plan === planFilter;
    return matchesSearch && matchesPlan;
  }) || [];

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case "premium":
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case "pro":
        return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"><Zap className="w-3 h-3 mr-1" />Pro</Badge>;
      default:
        return <Badge variant="secondary"><Star className="w-3 h-3 mr-1" />Basic</Badge>;
    }
  };

  // Calculate estimated MRR
  const estimatedMRR = (stats?.basicPlan || 0) * 19000 + 
    (stats?.proPlan || 0) * 49000 + 
    (stats?.premiumPlan || 0) * 129000;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">SaaS Admin</h1>
                <p className="text-sm text-muted-foreground">Tableau de bord administrateur</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Restaurants</p>
                  <p className="text-2xl font-bold">{stats?.totalRestaurants || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">MRR Estimé</p>
                  <p className="text-2xl font-bold">{estimatedMRR.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">FCFA/mois</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commandes</p>
                  <p className="text-2xl font-bold">{stats?.totalOrders?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <UtensilsCrossed className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CA Restaurants</p>
                  <p className="text-2xl font-bold">{(stats?.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-gray-400">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plan Basic</p>
                <p className="text-3xl font-bold">{stats?.basicPlan || 0}</p>
                <p className="text-xs text-muted-foreground">19 000 FCFA/mois</p>
              </div>
              <Star className="h-8 w-8 text-gray-400" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plan Pro</p>
                <p className="text-3xl font-bold">{stats?.proPlan || 0}</p>
                <p className="text-xs text-muted-foreground">49 000 FCFA/mois</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plan Premium</p>
                <p className="text-3xl font-bold">{stats?.premiumPlan || 0}</p>
                <p className="text-xs text-muted-foreground">129 000 FCFA/mois</p>
              </div>
              <Crown className="h-8 w-8 text-amber-500" />
            </CardContent>
          </Card>
        </div>

        {/* Restaurants List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Liste des restaurants
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="text-right">Commandes</TableHead>
                    <TableHead className="text-right hidden md:table-cell">CA</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">Équipe</TableHead>
                    <TableHead className="hidden lg:table-cell">Création</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRestaurants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun restaurant trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRestaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <UtensilsCrossed className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{restaurant.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {restaurant.total_menu_items} plats • {restaurant.total_tables} tables
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(restaurant.subscription_plan)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">
                            {restaurant.email && <p>{restaurant.email}</p>}
                            {restaurant.phone && <p className="text-muted-foreground">{restaurant.phone}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {restaurant.total_orders.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          {Number(restaurant.total_revenue).toLocaleString()} CFA
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell">
                          <div className="flex items-center justify-end gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {restaurant.team_size || 1}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(restaurant.created_at), "dd MMM yyyy", { locale: fr })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredRestaurants.length} restaurant(s) affiché(s)
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
