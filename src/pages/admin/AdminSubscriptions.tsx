import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RestaurantStats {
  id: string;
  name: string;
  subscription_plan: string | null;
  created_at: string | null;
}

const AdminSubscriptions = () => {
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

  const stats = {
    basicPlan: restaurants.filter(r => r.subscription_plan === 'basic').length,
    proPlan: restaurants.filter(r => r.subscription_plan === 'pro').length,
    premiumPlan: restaurants.filter(r => r.subscription_plan === 'premium').length,
  };

  const estimatedMRR = 
    stats.basicPlan * 19000 + 
    stats.proPlan * 49000 + 
    stats.premiumPlan * 129000;

  if (isLoading) {
    return (
      <AdminLayout title="Abonnements" description="Gestion des abonnements">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Abonnements" description="Vue d'ensemble des abonnements">
      {/* MRR Card */}
      <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 mb-8">
        <CardHeader>
          <CardTitle className="text-white text-lg">Revenu Mensuel Récurrent (MRR)</CardTitle>
          <CardDescription className="text-slate-400">Estimation basée sur les abonnements actifs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-white">
            {new Intl.NumberFormat('fr-FR').format(estimatedMRR)} FCFA
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                <Badge variant="outline" className="text-slate-300 border-slate-600 text-lg px-3 py-1">Basic</Badge>
              </CardTitle>
            </div>
            <CardDescription className="text-slate-400">19 000 FCFA/mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white mb-2">{stats.basicPlan}</div>
            <p className="text-slate-400">restaurants</p>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400">Revenu mensuel</div>
              <div className="text-lg font-semibold text-white">
                {new Intl.NumberFormat('fr-FR').format(stats.basicPlan * 19000)} FCFA
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                <Badge variant="secondary" className="text-lg px-3 py-1">Pro</Badge>
              </CardTitle>
            </div>
            <CardDescription className="text-slate-400">49 000 FCFA/mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white mb-2">{stats.proPlan}</div>
            <p className="text-slate-400">restaurants</p>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400">Revenu mensuel</div>
              <div className="text-lg font-semibold text-white">
                {new Intl.NumberFormat('fr-FR').format(stats.proPlan * 49000)} FCFA
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                <Badge className="text-lg px-3 py-1">Premium</Badge>
              </CardTitle>
            </div>
            <CardDescription className="text-slate-400">129 000 FCFA/mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white mb-2">{stats.premiumPlan}</div>
            <p className="text-slate-400">restaurants</p>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400">Revenu mensuel</div>
              <div className="text-lg font-semibold text-white">
                {new Intl.NumberFormat('fr-FR').format(stats.premiumPlan * 129000)} FCFA
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Comparison */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Comparaison des plans</CardTitle>
          <CardDescription className="text-slate-400">Fonctionnalités incluses par plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Fonctionnalité</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Basic</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Pro</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="py-3 px-4 text-white">Membres d'équipe</td>
                  <td className="text-center py-3 px-4 text-slate-300">3</td>
                  <td className="text-center py-3 px-4 text-slate-300">10</td>
                  <td className="text-center py-3 px-4 text-slate-300">Illimité</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white">Restaurants</td>
                  <td className="text-center py-3 px-4 text-slate-300">1</td>
                  <td className="text-center py-3 px-4 text-slate-300">3</td>
                  <td className="text-center py-3 px-4 text-slate-300">Illimité</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white">Gestion de stock</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white">Rapports avancés</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white">Export PDF/Excel</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white">Support prioritaire</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
