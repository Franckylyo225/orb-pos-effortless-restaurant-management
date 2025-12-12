import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, LogOut, Store, Users, CreditCard, TrendingUp, 
  Building2, ChefHat, UtensilsCrossed, Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RestaurantStats {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subscription_plan: string | null;
  team_size: number | null;
  total_orders: number | null;
  total_revenue: number | null;
  total_menu_items: number | null;
  total_tables: number | null;
  created_at: string | null;
}

interface DashboardStats {
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  basicPlan: number;
  proPlan: number;
  premiumPlan: number;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantStats[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    basicPlan: 0,
    proPlan: 0,
    premiumPlan: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;

      const { data, error } = await supabase
        .from('saas_restaurant_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRestaurants(data);
        
        const calculatedStats: DashboardStats = {
          totalRestaurants: data.length,
          totalOrders: data.reduce((acc, r) => acc + (r.total_orders || 0), 0),
          totalRevenue: data.reduce((acc, r) => acc + (r.total_revenue || 0), 0),
          basicPlan: data.filter(r => r.subscription_plan === 'basic').length,
          proPlan: data.filter(r => r.subscription_plan === 'pro').length,
          premiumPlan: data.filter(r => r.subscription_plan === 'premium').length,
        };
        setStats(calculatedStats);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getPlanBadgeVariant = (plan: string | null) => {
    switch (plan) {
      case 'premium': return 'default';
      case 'pro': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin SaaS</h1>
              <p className="text-sm text-slate-400">Tableau de bord</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Restaurants</CardTitle>
              <Building2 className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalRestaurants}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Commandes Totales</CardTitle>
              <UtensilsCrossed className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalOrders.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Revenus Totaux</CardTitle>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Abonnements</CardTitle>
              <CreditCard className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  Basic: {stats.basicPlan}
                </Badge>
                <Badge variant="secondary">Pro: {stats.proPlan}</Badge>
                <Badge>Premium: {stats.premiumPlan}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="restaurants" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="restaurants" className="data-[state=active]:bg-primary">
              <Store className="w-4 h-4 mr-2" />
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary">
              <CreditCard className="w-4 h-4 mr-2" />
              Abonnements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tous les restaurants</CardTitle>
                <CardDescription className="text-slate-400">
                  Liste complète des restaurants inscrits sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-700/50">
                        <TableHead className="text-slate-300">Restaurant</TableHead>
                        <TableHead className="text-slate-300">Contact</TableHead>
                        <TableHead className="text-slate-300">Plan</TableHead>
                        <TableHead className="text-slate-300 text-right">Commandes</TableHead>
                        <TableHead className="text-slate-300 text-right">Revenus</TableHead>
                        <TableHead className="text-slate-300 text-right">Menu</TableHead>
                        <TableHead className="text-slate-300">Inscrit le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {restaurants.map((restaurant) => (
                        <TableRow key={restaurant.id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center gap-2">
                              <ChefHat className="w-4 h-4 text-primary" />
                              {restaurant.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="text-sm">
                              {restaurant.email || '-'}
                              {restaurant.phone && <div className="text-slate-500">{restaurant.phone}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPlanBadgeVariant(restaurant.subscription_plan)}>
                              {restaurant.subscription_plan || 'basic'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-slate-300">
                            {(restaurant.total_orders || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-slate-300">
                            {formatCurrency(restaurant.total_revenue || 0)}
                          </TableCell>
                          <TableCell className="text-right text-slate-300">
                            {restaurant.total_menu_items || 0} plats
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {restaurant.created_at 
                              ? format(new Date(restaurant.created_at), 'dd MMM yyyy', { locale: fr })
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Badge variant="outline" className="text-slate-300 border-slate-600">Basic</Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-400">19 000 FCFA/mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{stats.basicPlan}</div>
                  <p className="text-slate-400 text-sm mt-1">restaurants</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Badge variant="secondary">Pro</Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-400">49 000 FCFA/mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{stats.proPlan}</div>
                  <p className="text-slate-400 text-sm mt-1">restaurants</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Badge>Premium</Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-400">129 000 FCFA/mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{stats.premiumPlan}</div>
                  <p className="text-slate-400 text-sm mt-1">restaurants</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
