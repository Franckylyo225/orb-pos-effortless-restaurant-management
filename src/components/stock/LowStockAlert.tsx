import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, RefreshCw } from "lucide-react";
import { useStock, StockProduct } from "@/hooks/useStock";
import { useRecipes } from "@/hooks/useRecipes";

export function LowStockAlert() {
  const { lowStockProducts, refetch } = useStock();
  const { checkStockAvailability } = useRecipes();

  const handleCheckAvailability = async () => {
    await checkStockAvailability();
    await refetch();
  };

  if (lowStockProducts.length === 0) return null;

  const outOfStock = lowStockProducts.filter((p) => p.current_stock <= 0);
  const lowStock = lowStockProducts.filter((p) => p.current_stock > 0);

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>Alertes de stock</span>
        <Button variant="ghost" size="sm" onClick={handleCheckAvailability} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Vérifier disponibilité
        </Button>
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          {outOfStock.length > 0 && (
            <div>
              <p className="font-medium text-destructive-foreground mb-1">
                Rupture de stock ({outOfStock.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {outOfStock.map((p) => (
                  <Badge key={p.id} variant="destructive" className="gap-1">
                    <Package className="h-3 w-3" />
                    {p.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {lowStock.length > 0 && (
            <div>
              <p className="font-medium text-destructive-foreground mb-1">
                Stock bas ({lowStock.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStock.map((p) => (
                  <Badge key={p.id} variant="outline" className="gap-1 border-orange-500 text-orange-600">
                    <Package className="h-3 w-3" />
                    {p.name}: {p.current_stock} {p.unit}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
