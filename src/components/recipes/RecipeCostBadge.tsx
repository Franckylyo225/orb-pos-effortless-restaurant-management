import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useRecipes } from "@/hooks/useRecipes";

interface RecipeCostBadgeProps {
  menuItemId: string;
  sellingPrice: number;
}

export function RecipeCostBadge({ menuItemId, sellingPrice }: RecipeCostBadgeProps) {
  const { getRecipeWithCost, getRecipeForItem } = useRecipes();
  const recipe = getRecipeForItem(menuItemId);
  
  if (recipe.length === 0) return null;

  const { total_cost, margin, margin_percent } = getRecipeWithCost(menuItemId, sellingPrice);

  const getMarginColor = () => {
    if (margin < 0) return "destructive";
    if (margin_percent < 30) return "secondary";
    return "default";
  };

  const getMarginIcon = () => {
    if (margin < 0) return <TrendingDown className="h-3 w-3" />;
    if (margin_percent < 30) return <AlertTriangle className="h-3 w-3" />;
    return <TrendingUp className="h-3 w-3" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getMarginColor()} className="gap-1 cursor-help">
            {getMarginIcon()}
            {margin_percent.toFixed(0)}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-1">
            <p>Coût matière: {total_cost.toLocaleString()} FCFA</p>
            <p>Marge: {margin.toLocaleString()} FCFA ({margin_percent.toFixed(1)}%)</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
