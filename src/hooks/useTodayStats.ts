import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";

interface TodayStats {
  ordersCount: number;
  paidOrdersCount: number;
  inKitchenCount: number;
  readyCount: number;
  totalRevenue: number;
}

export function useTodayStats() {
  const { restaurant } = useRestaurant();
  const [stats, setStats] = useState<TodayStats>({
    ordersCount: 0,
    paidOrdersCount: 0,
    inKitchenCount: 0,
    readyCount: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, total")
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", todayISO);

    if (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
      return;
    }

    const ordersCount = orders?.length || 0;
    const paidOrdersCount = orders?.filter((o) => o.status === "paid").length || 0;
    const inKitchenCount = orders?.filter((o) => o.status === "in_kitchen").length || 0;
    const readyCount = orders?.filter((o) => o.status === "ready").length || 0;
    const totalRevenue = orders
      ?.filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

    setStats({
      ordersCount,
      paidOrdersCount,
      inKitchenCount,
      readyCount,
      totalRevenue,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [restaurant?.id]);

  // Real-time updates
  useEffect(() => {
    if (!restaurant?.id) return;

    const channel = supabase
      .channel("today-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant?.id]);

  return { stats, loading, refetch: fetchStats };
}
