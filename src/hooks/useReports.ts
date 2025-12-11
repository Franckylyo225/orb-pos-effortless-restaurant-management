import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface RevenueStats {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  totalTax: number;
  totalDiscount: number;
  netRevenue: number;
}

export interface PaymentMethodSummary {
  method: string;
  label: string;
  count: number;
  total: number;
  percentage: number;
}

export interface ProductSales {
  name: string;
  quantity: number;
  revenue: number;
  costPrice: number;
  profit: number;
  margin: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

export function useReports(dateRange: DateRange) {
  const { restaurant } = useRestaurant();
  const [loading, setLoading] = useState(true);
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    totalTax: 0,
    totalDiscount: 0,
    netRevenue: 0,
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>([]);
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);

  const fetchReports = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fromISO = startOfDay(dateRange.from).toISOString();
    const toISO = endOfDay(dateRange.to).toISOString();

    // Fetch orders for the period
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total, subtotal, tax_amount, discount_amount, status, created_at")
      .eq("restaurant_id", restaurant.id)
      .eq("status", "paid")
      .gte("created_at", fromISO)
      .lte("created_at", toISO);

    const paidOrders = orders || [];
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalTax = paidOrders.reduce((sum, o) => sum + Number(o.tax_amount || 0), 0);
    const totalDiscount = paidOrders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
    const netRevenue = totalRevenue - totalTax;

    setRevenueStats({
      totalRevenue,
      totalOrders: paidOrders.length,
      averageTicket: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
      totalTax,
      totalDiscount,
      netRevenue,
    });

    // Fetch payments by method
    const orderIds = paidOrders.map((o) => o.id);
    if (orderIds.length > 0) {
      const { data: payments } = await supabase
        .from("payments")
        .select("payment_method, amount")
        .in("order_id", orderIds)
        .eq("status", "completed");

      const methodMap = new Map<string, { count: number; total: number }>();
      (payments || []).forEach((p) => {
        const existing = methodMap.get(p.payment_method) || { count: 0, total: 0 };
        methodMap.set(p.payment_method, {
          count: existing.count + 1,
          total: existing.total + Number(p.amount || 0),
        });
      });

      const methodLabels: Record<string, string> = {
        cash: "Espèces",
        card: "Carte bancaire",
        mobile_money: "Mobile Money",
        other: "Autre",
      };

      const totalPayments = Array.from(methodMap.values()).reduce((sum, m) => sum + m.total, 0);
      const methodSummaries: PaymentMethodSummary[] = Array.from(methodMap.entries()).map(
        ([method, data]) => ({
          method,
          label: methodLabels[method] || method,
          count: data.count,
          total: data.total,
          percentage: totalPayments > 0 ? Math.round((data.total / totalPayments) * 100) : 0,
        })
      );
      setPaymentMethods(methodSummaries.sort((a, b) => b.total - a.total));
    } else {
      setPaymentMethods([]);
    }

    // Fetch product sales with cost price for profit calculation
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        name,
        quantity,
        price,
        menu_item_id,
        orders!inner (status, created_at, restaurant_id)
      `)
      .eq("orders.restaurant_id", restaurant.id)
      .eq("orders.status", "paid")
      .gte("orders.created_at", fromISO)
      .lte("orders.created_at", toISO);

    // Get menu items for cost prices
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, cost_price")
      .eq("restaurant_id", restaurant.id);

    const costMap = new Map<string, number>();
    (menuItems || []).forEach((item) => {
      costMap.set(item.id, Number(item.cost_price || 0));
    });

    // Aggregate product sales
    const productMap = new Map<string, { quantity: number; revenue: number; costPrice: number }>();
    (orderItems || []).forEach((item: any) => {
      const existing = productMap.get(item.name) || { quantity: 0, revenue: 0, costPrice: 0 };
      const itemCost = item.menu_item_id ? (costMap.get(item.menu_item_id) || 0) : 0;
      productMap.set(item.name, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
        costPrice: existing.costPrice + itemCost * item.quantity,
      });
    });

    const productSalesArray: ProductSales[] = Array.from(productMap.entries())
      .map(([name, data]) => {
        const profit = data.revenue - data.costPrice;
        const margin = data.revenue > 0 ? Math.round((profit / data.revenue) * 100) : 0;
        return { name, ...data, profit, margin };
      })
      .sort((a, b) => b.revenue - a.revenue);

    setProductSales(productSalesArray);

    // Calculate daily sales for chart
    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    paidOrders.forEach((order) => {
      const dateKey = format(new Date(order.created_at), "yyyy-MM-dd");
      const existing = dailyMap.get(dateKey) || { revenue: 0, orders: 0 };
      dailyMap.set(dateKey, {
        revenue: existing.revenue + Number(order.total || 0),
        orders: existing.orders + 1,
      });
    });

    // Fill in missing dates
    const dailySalesArray: DailySales[] = [];
    let currentDate = new Date(dateRange.from);
    while (currentDate <= dateRange.to) {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      const data = dailyMap.get(dateKey) || { revenue: 0, orders: 0 };
      dailySalesArray.push({
        date: dateKey,
        ...data,
      });
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    setDailySales(dailySalesArray);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [restaurant?.id, dateRange.from.getTime(), dateRange.to.getTime()]);

  return {
    loading,
    revenueStats,
    paymentMethods,
    productSales,
    dailySales,
    refetch: fetchReports,
  };
}

export function getPresetRanges(): { label: string; range: DateRange }[] {
  const today = new Date();
  return [
    {
      label: "Aujourd'hui",
      range: { from: startOfDay(today), to: endOfDay(today) },
    },
    {
      label: "Hier",
      range: { from: startOfDay(subDays(today, 1)), to: endOfDay(subDays(today, 1)) },
    },
    {
      label: "7 derniers jours",
      range: { from: startOfDay(subDays(today, 6)), to: endOfDay(today) },
    },
    {
      label: "30 derniers jours",
      range: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
    },
    {
      label: "Ce mois",
      range: { from: startOfMonth(today), to: endOfMonth(today) },
    },
  ];
}
