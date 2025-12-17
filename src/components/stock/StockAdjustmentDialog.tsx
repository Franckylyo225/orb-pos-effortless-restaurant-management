import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2 } from "lucide-react";
import { useStock, StockProduct } from "@/hooks/useStock";

interface StockAdjustmentDialogProps {
  product: StockProduct;
}

const ADJUSTMENT_REASONS = [
  { value: "inventory_count", label: "Inventaire physique" },
  { value: "loss", label: "Perte / Casse" },
  { value: "theft", label: "Vol" },
  { value: "expiry", label: "Péremption" },
  { value: "correction", label: "Correction d'erreur" },
  { value: "other", label: "Autre" },
];

export function StockAdjustmentDialog({ product }: StockAdjustmentDialogProps) {
  const { addStockMovement } = useStock();
  const [open, setOpen] = useState(false);
  const [newStock, setNewStock] = useState<string>(product.current_stock.toString());
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdjustment = async () => {
    if (!reason) return;

    const newStockValue = parseFloat(newStock);
    const difference = newStockValue - product.current_stock;

    if (difference === 0) {
      setOpen(false);
      return;
    }

    setIsSubmitting(true);

    const reasonLabel = ADJUSTMENT_REASONS.find((r) => r.value === reason)?.label || reason;
    const fullNotes = `Ajustement (${reasonLabel}): ${notes}`.trim();

    await addStockMovement(product.id, newStockValue, "adjustment", fullNotes);

    setOpen(false);
    setReason("");
    setNotes("");
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Ajuster
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuster le stock: {product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Stock actuel</p>
            <p className="text-2xl font-bold">
              {product.current_stock} {product.unit}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Nouveau stock</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />
            {parseFloat(newStock) !== product.current_stock && (
              <p className="text-sm text-muted-foreground">
                Différence:{" "}
                <span className={parseFloat(newStock) > product.current_stock ? "text-green-600" : "text-destructive"}>
                  {parseFloat(newStock) > product.current_stock ? "+" : ""}
                  {(parseFloat(newStock) - product.current_stock).toFixed(2)} {product.unit}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Motif de l'ajustement *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un motif" />
              </SelectTrigger>
              <SelectContent>
                {ADJUSTMENT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes additionnelles</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails supplémentaires..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleAdjustment}
            disabled={!reason || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer l'ajustement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
