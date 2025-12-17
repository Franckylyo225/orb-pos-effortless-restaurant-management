import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, TrendingDown, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StockProduct } from "@/hooks/useStock";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

interface StockMovementHistoryProps {
  product: StockProduct;
}

export function StockMovementHistory({ product }: StockMovementHistoryProps) {
  const [open, setOpen] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMovements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stock_movements")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setMovements(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchMovements();
    }
  }, [open, product.id]);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "out":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "in":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Entrée</Badge>;
      case "out":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Sortie</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Ajustement</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 w-full justify-start">
          <History className="h-4 w-4" />
          Historique
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique: {product.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucun mouvement enregistré</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">
                    {format(new Date(movement.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementIcon(movement.movement_type)}
                      {getMovementBadge(movement.movement_type)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={
                      movement.movement_type === "in" 
                        ? "text-green-600" 
                        : movement.movement_type === "out" 
                        ? "text-red-600" 
                        : "text-blue-600"
                    }>
                      {movement.movement_type === "in" ? "+" : movement.movement_type === "out" ? "-" : ""}
                      {movement.quantity} {product.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {movement.notes || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
