import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Table {
  id: string;
  restaurant_id: string;
  name: string;
  capacity: number;
  position_x: number;
  position_y: number;
  shape: "square" | "circle" | "rectangle";
  status: "free" | "occupied" | "reserved" | "cleaning";
  assigned_server_id: string | null;
}

export interface OrderItem {
  id?: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  variant?: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  order_number: number;
  status: "pending" | "in_kitchen" | "ready" | "served" | "paid" | "cancelled";
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  items?: OrderItem[];
  table?: Table;
}

export function useOrders() {
  const { restaurant } = useRestaurant();
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch tables
    const { data: tablesData, error: tablesError } = await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("name");

    if (tablesError) {
      console.error("Error fetching tables:", tablesError);
    } else {
      setTables((tablesData as Table[]) || []);
    }

    // Fetch active orders
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .not("status", "eq", "paid")
      .not("status", "eq", "cancelled")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    } else {
      setOrders((ordersData as unknown as Order[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [restaurant?.id]);

  // Real-time subscription for orders
  useEffect(() => {
    if (!restaurant?.id) return;

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant?.id]);

  // Table operations
  const addTable = async (data: { name: string; capacity?: number; shape?: string }) => {
    if (!restaurant?.id) return { error: new Error("No restaurant") };

    const { data: newTable, error } = await supabase
      .from("tables")
      .insert({
        restaurant_id: restaurant.id,
        name: data.name,
        capacity: data.capacity || 4,
        shape: data.shape || "square",
        status: "free",
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setTables((prev) => [...prev, newTable as Table]);
    toast({ title: "Table ajoutée" });
    return { error: null, table: newTable };
  };

  const updateTableStatus = async (tableId: string, status: Table["status"]) => {
    const { error } = await supabase
      .from("tables")
      .update({ status })
      .eq("id", tableId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setTables((prev) =>
      prev.map((table) => (table.id === tableId ? { ...table, status } : table))
    );
    return { error: null };
  };

  const deleteTable = async (tableId: string) => {
    const { error } = await supabase.from("tables").delete().eq("id", tableId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setTables((prev) => prev.filter((table) => table.id !== tableId));
    toast({ title: "Table supprimée" });
    return { error: null };
  };

  // Order operations
  const createOrder = async (
    items: OrderItem[],
    tableId: string | null,
    discountPercent: number = 0
  ) => {
    if (!restaurant?.id) return { error: new Error("No restaurant") };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount;

    // Create order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        table_id: tableId,
        status: "pending",
        subtotal,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        total,
        created_by: user?.id,
      })
      .select()
      .single();

    if (orderError) {
      toast({ title: "Erreur", description: orderError.message, variant: "destructive" });
      return { error: orderError };
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: newOrder.id,
      menu_item_id: item.menu_item_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
      variant: item.variant,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
    }

    // Update table status if applicable
    if (tableId) {
      await updateTableStatus(tableId, "occupied");
    }

    setOrders((prev) => [newOrder as unknown as Order, ...prev]);
    toast({ title: "Commande créée", description: `Commande #${newOrder.order_number}` });
    return { error: null, order: newOrder };
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    const order = orders.find((o) => o.id === orderId);
    
    // Free up table if order is paid or cancelled
    if ((status === "paid" || status === "cancelled") && order?.table_id) {
      await updateTableStatus(order.table_id, "free");
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    return { error: null };
  };

  const processPayment = async (
    orderId: string,
    amount: number,
    method: "cash" | "card" | "mobile_money"
  ) => {
    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderId,
      amount,
      payment_method: method,
      status: "completed",
      processed_by: user?.id,
    });

    if (paymentError) {
      toast({ title: "Erreur", description: paymentError.message, variant: "destructive" });
      return { error: paymentError };
    }

    // Update order status
    await updateOrderStatus(orderId, "paid");

    toast({ title: "Paiement validé ✓", description: `${amount.toLocaleString()} CFA` });
    return { error: null };
  };

  const activeOrders = orders.filter((o) => o.status !== "paid" && o.status !== "cancelled");

  return {
    tables,
    orders,
    activeOrders,
    loading,
    addTable,
    updateTableStatus,
    deleteTable,
    createOrder,
    updateOrderStatus,
    processPayment,
    refetch: fetchData,
  };
}
