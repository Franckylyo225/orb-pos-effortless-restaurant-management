import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, UtensilsCrossed, TrendingUp, CreditCard, ChefHat
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

interface RestaurantStats {
  id: string;
  name: string;
  subscription_plan: string | null;
  total_orders: number | null;
  total_revenue: number | null;
  created_at: string | null;
}

const AdminAnalytics = () => {
  const [restaurants, setRestaurants] = useState<RestaurantStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('saas_restaurant_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRestaurants(data);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const stats = useMemo(() => ({
    totalRestaurants: restaurants.length,
    totalOrders: restaurants.reduce((acc, r) => acc + (r.total_orders || 0), 0),
    totalRevenue: restaurants.reduce((acc, r) => acc + (r.total_revenue || 0), 0),
    basicPlan: restaurants.filter(r => r.subscription_plan === 'basic').length,
    proPlan: restaurants.filter(r => r.subscription_plan === 'pro').length,
    premiumPlan: restaurants.filter(r => r.subscription_plan === 'premium').length,
  }), [restaurants]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
    return amount.toString();
  };

  if (isLoading) {
    return (
      <AdminLayout title="Analytics" description="Vue d'ensemble de la plateforme">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics" description="Vue d'ensemble de la plateforme">
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
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                Basic: {stats.basicPlan}
              </Badge>
              <Badge variant="secondary">Pro: {stats.proPlan}</Badge>
              <Badge>Premium: {stats.premiumPlan}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Nouvelles inscriptions
            </CardTitle>
            <CardDescription className="text-slate-400">
              Évolution sur les 6 derniers mois
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
                  <Area type="monotone" dataKey="inscriptions" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorInscriptions)" name="Inscriptions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Revenus cumulés
            </CardTitle>
            <CardDescription className="text-slate-400">
              Évolution des revenus totaux
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
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => formatCurrencyShort(value)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc' }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenus" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Répartition des plans
            </CardTitle>
            <CardDescription className="text-slate-400">
              Distribution par type d'abonnement
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
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-500" />
              Top 5 Restaurants
            </CardTitle>
            <CardDescription className="text-slate-400">
              Meilleurs revenus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.topRestaurants} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(value) => formatCurrencyShort(value)} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                  />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Revenus" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
