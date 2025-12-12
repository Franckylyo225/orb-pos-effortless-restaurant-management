import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RestaurantStats {
  id: string;
  name: string;
  subscription_plan: string | null;
  created_at: string;
  email: string | null;
  phone: string | null;
  team_size: number | null;
  total_orders: number;
  total_menu_items: number;
  total_tables: number;
  total_revenue: number;
}

interface SaasStats {
  totalRestaurants: number;
  basicPlan: number;
  proPlan: number;
  premiumPlan: number;
  totalRevenue: number;
  totalOrders: number;
  recentRestaurants: RestaurantStats[];
  allRestaurants: RestaurantStats[];
}

export function useSaasAdmin() {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SaasStats | null>(null);

  useEffect(() => {
    checkSuperAdmin();
  }, [user?.id]);

  const checkSuperAdmin = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("super_admins")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setIsSuperAdmin(true);
        await fetchStats();
      } else {
        setIsSuperAdmin(false);
      }
    } catch (err) {
      console.error("Error checking super admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch all restaurants with their stats using the view
      const { data: restaurants, error } = await supabase
        .from("saas_restaurant_stats")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching restaurant stats:", error);
        return;
      }

      const allRestaurants = (restaurants || []) as RestaurantStats[];

      // Calculate aggregated stats
      const totalRestaurants = allRestaurants.length;
      const basicPlan = allRestaurants.filter(r => r.subscription_plan === "basic" || !r.subscription_plan).length;
      const proPlan = allRestaurants.filter(r => r.subscription_plan === "pro").length;
      const premiumPlan = allRestaurants.filter(r => r.subscription_plan === "premium").length;
      const totalRevenue = allRestaurants.reduce((sum, r) => sum + Number(r.total_revenue || 0), 0);
      const totalOrders = allRestaurants.reduce((sum, r) => sum + Number(r.total_orders || 0), 0);
      const recentRestaurants = allRestaurants.slice(0, 5);

      setStats({
        totalRestaurants,
        basicPlan,
        proPlan,
        premiumPlan,
        totalRevenue,
        totalOrders,
        recentRestaurants,
        allRestaurants,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return {
    isSuperAdmin,
    loading,
    stats,
    refetch: fetchStats,
  };
}
