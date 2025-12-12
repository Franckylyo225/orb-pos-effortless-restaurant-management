import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, LogOut, Store, CreditCard, TrendingUp, 
  Building2, ChefHat, UtensilsCrossed, Loader2, UserPlus, Trash2, Users, BarChart3
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

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

interface SuperAdmin {
  id: string;
  user_id: string;
  created_at: string;
  email?: string;
  full_name?: string;
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
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    basicPlan: 0,
    proPlan: 0,
    premiumPlan: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchSuperAdmins = async () => {
    const { data: adminsData, error: adminsError } = await supabase
      .from('super_admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (!adminsError && adminsData) {
      // Fetch profiles for each admin
      const adminsWithProfiles = await Promise.all(
        adminsData.map(async (admin) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', admin.user_id)
            .maybeSingle();
          
          return {
            ...admin,
            email: profile?.email || 'Email non disponible',
            full_name: profile?.full_name || 'Nom non disponible',
          };
        })
      );
      setSuperAdmins(adminsWithProfiles);
    }
  };

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

      await fetchSuperAdmins();
      setIsLoading(false);
    };

    fetchData();
  }, [isAdmin]);

  const handleAddSuperAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error('Veuillez entrer un email');
      return;
    }

    setIsAddingAdmin(true);

    // Find user by email in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', newAdminEmail.trim())
      .maybeSingle();

    if (profileError || !profile) {
      toast.error('Utilisateur non trouvé avec cet email');
      setIsAddingAdmin(false);
      return;
    }

    // Check if already admin
    const { data: existingAdmin } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existingAdmin) {
      toast.error('Cet utilisateur est déjà super admin');
      setIsAddingAdmin(false);
      return;
    }

    // Add as super admin
    const { error: insertError } = await supabase
      .from('super_admins')
      .insert({ user_id: profile.id });

    if (insertError) {
      toast.error('Erreur lors de l\'ajout du super admin');
      setIsAddingAdmin(false);
      return;
    }

    toast.success(`${profile.full_name || profile.email} ajouté comme super admin`);
    setNewAdminEmail('');
    setDialogOpen(false);
    setIsAddingAdmin(false);
    fetchSuperAdmins();
  };

  const handleRemoveSuperAdmin = async (adminId: string, adminEmail: string) => {
    if (superAdmins.length <= 1) {
      toast.error('Impossible de supprimer le dernier super admin');
      return;
    }

    const { error } = await supabase
      .from('super_admins')
      .delete()
      .eq('id', adminId);

    if (error) {
      toast.error('Erreur lors de la suppression');
      return;
    }

    toast.success(`${adminEmail} supprimé des super admins`);
    fetchSuperAdmins();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K';
    }
    return amount.toString();
  };

  const getPlanBadgeVariant = (plan: string | null) => {
    switch (plan) {
      case 'premium': return 'default';
      case 'pro': return 'secondary';
      default: return 'outline';
    }
  };

  // Chart data calculations
  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM yyyy', { locale: fr }),
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    });

    const registrationsByMonth = last6Months.map(({ month, start, end }) => {
      const count = restaurants.filter(r => {
        if (!r.created_at) return false;
        const createdAt = parseISO(r.created_at);
        return isWithinInterval(createdAt, { start, end });
      }).length;
      return { month, inscriptions: count };
    });

    const revenueByMonth = last6Months.map(({ month, start, end }) => {
      const monthlyRestaurants = restaurants.filter(r => {
        if (!r.created_at) return false;
        const createdAt = parseISO(r.created_at);
        return createdAt <= end;
      });
      const revenue = monthlyRestaurants.reduce((acc, r) => acc + (r.total_revenue || 0), 0);
      return { month, revenue };
    });

    const planDistribution = [
      { name: 'Basic', value: stats.basicPlan, color: '#64748b' },
      { name: 'Pro', value: stats.proPlan, color: '#8b5cf6' },
      { name: 'Premium', value: stats.premiumPlan, color: '#f97316' },
    ].filter(p => p.value > 0);

    const topRestaurants = [...restaurants]
      .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
      .slice(0, 5)
      .map(r => ({
        name: r.name.length > 15 ? r.name.substring(0, 15) + '...' : r.name,
        revenue: r.total_revenue || 0,
      }));

    return { registrationsByMonth, revenueByMonth, planDistribution, topRestaurants };
  }, [restaurants, stats]);

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
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="data-[state=active]:bg-primary">
              <Store className="w-4 h-4 mr-2" />
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary">
              <CreditCard className="w-4 h-4 mr-2" />
              Abonnements
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-primary">
              <Users className="w-4 h-4 mr-2" />
              Super Admins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Inscriptions Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Nouvelles inscriptions
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Évolution des inscriptions sur les 6 derniers mois
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.registrationsByMonth}>
                        <defs>
                          <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#f8fafc' }}
                          itemStyle={{ color: '#f97316' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="inscriptions" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorInscriptions)" 
                          name="Inscriptions"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Revenus cumulés
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Évolution des revenus totaux de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.revenueByMonth}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={12} 
                          tickFormatter={(value) => formatCurrencyShort(value)}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#f8fafc' }}
                          formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                          name="Revenus"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Distribution */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Répartition des abonnements
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Distribution des restaurants par plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.planDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {chartData.planDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#f8fafc' }}
                        />
                        <Legend 
                          wrapperStyle={{ color: '#94a3b8' }}
                          formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Restaurants */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-amber-500" />
                    Top 5 Restaurants
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Restaurants avec les meilleurs revenus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.topRestaurants} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis 
                          type="number" 
                          stroke="#94a3b8" 
                          fontSize={12}
                          tickFormatter={(value) => formatCurrencyShort(value)}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          stroke="#94a3b8" 
                          fontSize={12}
                          width={100}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#f8fafc' }}
                          formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                        />
                        <Bar 
                          dataKey="revenue" 
                          fill="#f59e0b" 
                          radius={[0, 4, 4, 0]}
                          name="Revenus"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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

          <TabsContent value="admins">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Super Administrateurs</CardTitle>
                  <CardDescription className="text-slate-400">
                    Gérez les utilisateurs ayant accès au dashboard admin
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Ajouter un admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Ajouter un super admin</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Entrez l'email d'un utilisateur existant pour lui donner accès au dashboard admin.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Email de l'utilisateur</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="utilisateur@example.com"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600 text-slate-300">
                        Annuler
                      </Button>
                      <Button onClick={handleAddSuperAdmin} disabled={isAddingAdmin}>
                        {isAddingAdmin ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Ajout...
                          </>
                        ) : (
                          'Ajouter'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-700/50">
                        <TableHead className="text-slate-300">Nom</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Ajouté le</TableHead>
                        <TableHead className="text-slate-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {superAdmins.map((admin) => (
                        <TableRow key={admin.id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-primary" />
                              {admin.full_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">{admin.email}</TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {format(new Date(admin.created_at), 'dd MMM yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSuperAdmin(admin.id, admin.email || '')}
                              disabled={superAdmins.length <= 1 || admin.user_id === user?.id}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
