import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  todayCustomers: number;
  averageTicket: number;
}

interface RecentOrder {
  id: string;
  order_number: number;
  table_name: string;
  items_count: number;
  total: number;
  status: string;
  created_at: string;
}

interface StockAlert {
  id: string;
  name: string;
  current_stock: number;
  min_stock_threshold: number;
  unit: string;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export function useDashboardStats() {
  const { restaurant } = useRestaurant();
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    todayCustomers: 0,
    averageTicket: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Fetch today's orders for stats
    const { data: todayOrders } = await supabase
      .from("orders")
      .select("total, status, table_id")
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", todayISO);

    const paidOrders = todayOrders?.filter((o) => o.status === "paid") || [];
    const todayRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const ordersCount = todayOrders?.length || 0;
    const uniqueTables = new Set(todayOrders?.map((o) => o.table_id).filter(Boolean)).size;
    const customersEstimate = uniqueTables || Math.ceil(ordersCount * 0.7);
    const averageTicket = paidOrders.length > 0 ? todayRevenue / paidOrders.length : 0;

    setStats({
      todayRevenue,
      todayOrders: ordersCount,
      todayCustomers: customersEstimate,
      averageTicket: Math.round(averageTicket),
    });

    // Fetch recent orders
    const { data: recent } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total,
        status,
        created_at,
        tables (name),
        order_items (id)
      `)
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentOrders(
      (recent || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        table_name: order.tables?.name || "Comptoir",
        items_count: order.order_items?.length || 0,
        total: Number(order.total || 0),
        status: order.status,
        created_at: order.created_at,
      }))
    );

    // Fetch stock alerts
    const { data: alerts } = await supabase
      .from("stock_products")
      .select("id, name, current_stock, min_stock_threshold, unit")
      .eq("restaurant_id", restaurant.id)
      .filter("current_stock", "lte", "min_stock_threshold")
      .order("current_stock", { ascending: true })
      .limit(5);

    setStockAlerts(
      (alerts || []).map((p) => ({
        id: p.id,
        name: p.name,
        current_stock: Number(p.current_stock || 0),
        min_stock_threshold: Number(p.min_stock_threshold || 5),
        unit: p.unit || "unité",
      }))
    );

    // Fetch top products (from paid orders today)
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        name,
        quantity,
        price,
        orders!inner (status, created_at, restaurant_id)
      `)
      .eq("orders.restaurant_id", restaurant.id)
      .eq("orders.status", "paid")
      .gte("orders.created_at", todayISO);

    // Aggregate by product name
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    (orderItems || []).forEach((item: any) => {
      const existing = productMap.get(item.name) || { quantity: 0, revenue: 0 };
      productMap.set(item.name, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
      });
    });

    const topProductsArray = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    setTopProducts(topProductsArray);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [restaurant?.id]);

  // Real-time updates
  useEffect(() => {
    if (!restaurant?.id) return;

    const channel = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchDashboardData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_products" },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant?.id]);

  return { stats, recentOrders, stockAlerts, topProducts, loading, refetch: fetchDashboardData };
}
