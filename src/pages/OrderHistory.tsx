import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { PaymentSuccessModal } from "@/components/pos/PaymentSuccessModal";
import {
  Search,
  Printer,
  CalendarIcon,
  Loader2,
  Receipt,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: number;
  status: string;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  total: number;
  created_at: string;
  table?: { name: string } | null;
  items: OrderItem[];
  payment?: {
    payment_method: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  pending: "En attente",
  in_kitchen: "En cuisine",
  ready: "Prête",
  served: "Servie",
  paid: "Payée",
  cancelled: "Annulée",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  in_kitchen: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  ready: "bg-green-500/10 text-green-600 border-green-500/20",
  served: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  paid: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function OrderHistory() {
  const { restaurant } = useRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (restaurant?.id) {
      fetchOrders();
    }
  }, [restaurant?.id, statusFilter, selectedDate]);

  const fetchOrders = async () => {
    if (!restaurant?.id) return;

    setLoading(true);

    let query = supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        subtotal,
        discount_percent,
        discount_amount,
        total,
        created_at,
        table:tables(name),
        items:order_items(id, name, quantity, price),
        payment:payments(payment_method)
      `)
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as "pending" | "in_kitchen" | "ready" | "served" | "paid" | "cancelled");
    }

    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      const formattedOrders = (data || []).map((order: any) => ({
        ...order,
        table: order.table?.[0] || order.table || null,
        items: order.items || [],
        payment: order.payment?.[0] || null,
      }));
      setOrders(formattedOrders);
    }

    setLoading(false);
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number.toString().includes(query) ||
      order.table?.name?.toLowerCase().includes(query)
    );
  });

  const handlePrintReceipt = (order: Order) => {
    setSelectedOrder(order);
    setShowReceipt(true);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: fr });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">
              Historique des commandes
            </h1>
            <p className="text-muted-foreground">
              Consultez et réimprimez les reçus
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Rechercher par n° ou table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="paid">Payées</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="in_kitchen">En cuisine</SelectItem>
              <SelectItem value="ready">Prêtes</SelectItem>
              <SelectItem value="cancelled">Annulées</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, "dd MMM yyyy", { locale: fr })
                  : "Filtrer par date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
              />
              {selectedDate && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Effacer le filtre
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold">
                      #{order.order_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>{order.table?.name || "Comptoir"}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {order.items.length} article
                        {order.items.length > 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {Number(order.total).toLocaleString("fr-FR")} CFA
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status] || ""}
                      >
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.payment?.payment_method === "cash" && "Espèces"}
                      {order.payment?.payment_method === "card" && "Carte"}
                      {order.payment?.payment_method === "mobile_money" && "Mobile"}
                      {!order.payment && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === "paid" && order.payment && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintReceipt(order)}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Reçu
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Receipt Modal */}
        {selectedOrder && showReceipt && (
          <PaymentSuccessModal
            open={showReceipt}
            onClose={() => {
              setShowReceipt(false);
              setSelectedOrder(null);
            }}
            orderNumber={selectedOrder.order_number}
            total={Number(selectedOrder.total)}
            items={selectedOrder.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: Number(item.price),
            }))}
            subtotal={Number(selectedOrder.subtotal)}
            discountPercent={Number(selectedOrder.discount_percent) || 0}
            discountAmount={Number(selectedOrder.discount_amount) || 0}
            paymentMethod={selectedOrder.payment?.payment_method || "cash"}
            tableName={selectedOrder.table?.name}
            restaurantName={restaurant?.name || "Restaurant"}
            restaurantAddress={restaurant?.address || undefined}
            restaurantPhone={restaurant?.phone || undefined}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
