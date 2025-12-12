import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChefHat, Search } from 'lucide-react';
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

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState<RestaurantStats[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('saas_restaurant_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRestaurants(data);
        setFilteredRestaurants(data);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = restaurants.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone?.includes(searchQuery)
    );
    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants]);

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

  if (isLoading) {
    return (
      <AdminLayout title="Restaurants" description="Gestion des restaurants">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Restaurants" description="Gestion des restaurants inscrits">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-white">Tous les restaurants ({restaurants.length})</CardTitle>
              <CardDescription className="text-slate-400">
                Liste complète des restaurants sur la plateforme
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
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
                {filteredRestaurants.map((restaurant) => (
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
                {filteredRestaurants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      Aucun restaurant trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminRestaurants;
