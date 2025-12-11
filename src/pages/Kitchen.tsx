import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useOrders } from "@/hooks/useOrders";
import { useOrderNotifications } from "@/hooks/useOrderNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, ChefHat } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function Kitchen() {
  const { orders, updateOrderStatus, loading } = useOrders();
  useOrderNotifications("kitchen");

  // Filter orders that are in the kitchen
  const kitchenOrders = orders.filter(
    (order) => order.status === "in_kitchen"
  );

  // Filter orders that are ready (for reference)
  const readyOrders = orders.filter((order) => order.status === "ready");

  const handleMarkReady = async (orderId: string, orderNumber: number) => {
    try {
      await updateOrderStatus(orderId, "ready");
      toast.success(`Commande #${orderNumber} prête !`);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Cuisine</h1>
              <p className="text-muted-foreground">
                {kitchenOrders.length} commande(s) en préparation
              </p>
            </div>
          </div>
        </div>

        {/* Kitchen Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchenOrders.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ChefHat className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">
                    Aucune commande en cuisine
                  </p>
                  <p className="text-sm text-muted-foreground/70 text-center mt-1">
                    Les nouvelles commandes apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            kitchenOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-primary/5 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Commande #{order.order_number}
                    </CardTitle>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(order.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </Badge>
                  </div>
                  {order.table && (
                    <p className="text-sm text-muted-foreground">
                      Table: {order.table.name}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {(order.items || []).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.notes && (
                          <span className="text-xs text-muted-foreground italic">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() =>
                      handleMarkReady(order.id, order.order_number)
                    }
                  >
                    <CheckCircle className="w-5 h-5" />
                    Marquer comme prêt
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Ready Orders Section */}
        {readyOrders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Commandes prêtes ({readyOrders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {readyOrders.map((order) => (
                <Card
                  key={order.id}
                  className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          Commande #{order.order_number}
                        </p>
                        {order.table && (
                          <p className="text-sm text-muted-foreground">
                            {order.table.name}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-green-500">Prêt</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
