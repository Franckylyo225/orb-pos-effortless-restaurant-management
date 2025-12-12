import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/hooks/useMenu";

interface Variant {
  name: string;
  price: number;
}

interface VariantSelectionModalProps {
  open: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onSelectVariant: (item: MenuItem, variant: Variant) => void;
  onSelectBase: (item: MenuItem) => void;
  itemDisplay: { type: "emoji" | "image"; value: string } | null;
}

export function VariantSelectionModal({
  open,
  onClose,
  item,
  onSelectVariant,
  onSelectBase,
  itemDisplay,
}: VariantSelectionModalProps) {
  if (!item) return null;

  const variants = (item.variants as unknown as Variant[])?.filter(
    (v): v is Variant => typeof v === "object" && v !== null && "name" in v && "price" in v && v.price > 0
  ) || [];

  const handleSelectVariant = (variant: Variant) => {
    onSelectVariant(item, variant);
    onClose();
  };

  const handleSelectBase = () => {
    onSelectBase(item);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {itemDisplay?.type === "image" ? (
              <img src={itemDisplay.value} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <span className="text-3xl">{itemDisplay?.value || "🍽️"}</span>
            )}
            <span>{item.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">Choisissez une taille :</p>
          
          {/* Base price option */}
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center justify-between"
            onClick={handleSelectBase}
          >
            <span className="font-medium">Standard</span>
            <span className="text-primary font-bold">
              {Number(item.price).toLocaleString()} CFA
            </span>
          </Button>

          {/* Variant options */}
          {variants.map((variant, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full h-auto py-4 flex items-center justify-between hover:border-primary hover:bg-primary/5"
              onClick={() => handleSelectVariant(variant)}
            >
              <span className="font-medium">{variant.name}</span>
              <span className="text-primary font-bold">
                {variant.price.toLocaleString()} CFA
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
