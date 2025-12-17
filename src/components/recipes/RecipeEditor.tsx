import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";
import { useRecipes, RecipeIngredient, convertUnit, areUnitsCompatible, getConversionDisplay } from "@/hooks/useRecipes";
import { useStock, StockProduct } from "@/hooks/useStock";

interface RecipeEditorProps {
  menuItemId: string;
  menuItemName: string;
  sellingPrice: number;
}

export function RecipeEditor({ menuItemId, menuItemName, sellingPrice }: RecipeEditorProps) {
  const { getRecipeForItem, addIngredientToRecipe, removeIngredientFromRecipe, updateIngredient, getRecipeWithCost } = useRecipes();
  const { products } = useStock();
  const [open, setOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [unit, setUnit] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipe = getRecipeForItem(menuItemId);
  const recipeWithCost = getRecipeWithCost(menuItemId, sellingPrice);

  const handleAddIngredient = async () => {
    if (!selectedProduct || !quantity) return;

    setIsSubmitting(true);
    const product = products.find((p) => p.id === selectedProduct);
    
    await addIngredientToRecipe({
      menu_item_id: menuItemId,
      stock_product_id: selectedProduct,
      quantity: parseFloat(quantity),
      unit: unit || product?.unit || "unité",
    });

    setSelectedProduct("");
    setQuantity("1");
    setUnit("");
    setAddDialogOpen(false);
    setIsSubmitting(false);
  };

  const handleRemoveIngredient = async (id: string) => {
    await removeIngredientFromRecipe(id, menuItemId);
  };

  const handleUpdateQuantity = async (ingredient: RecipeIngredient, newQuantity: number) => {
    if (newQuantity <= 0) return;
    await updateIngredient(ingredient.id, menuItemId, { quantity: newQuantity });
  };

  const availableProducts = products.filter(
    (p) => !recipe.some((r) => r.stock_product_id === p.id)
  );

  const hasLowStockIngredient = recipe.some((ing) => {
    if (!ing.stock_product) return false;
    const stockUnit = ing.stock_product.unit;
    const convertedQty = convertUnit(ing.quantity, ing.unit, stockUnit);
    return ing.stock_product.current_stock < convertedQty;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Fiche technique
          {recipe.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {recipe.length}
            </Badge>
          )}
          {hasLowStockIngredient && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Fiche technique: {menuItemName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cost Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Analyse des coûts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prix de vente</p>
                  <p className="text-lg font-semibold">{sellingPrice.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coût matière</p>
                  <p className="text-lg font-semibold">{recipeWithCost.total_cost.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marge brute</p>
                  <p className={`text-lg font-semibold ${recipeWithCost.margin < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {recipeWithCost.margin.toLocaleString()} FCFA
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taux de marge</p>
                  <p className={`text-lg font-semibold ${recipeWithCost.margin_percent < 30 ? 'text-orange-500' : 'text-green-600'}`}>
                    {recipeWithCost.margin_percent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Ingrédients ({recipe.length})</h3>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un ingrédient
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un ingrédient</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Ingrédient</Label>
                      <Select value={selectedProduct} onValueChange={(val) => {
                        setSelectedProduct(val);
                        const product = products.find((p) => p.id === val);
                        if (product) setUnit(product.unit);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un ingrédient" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.current_stock} {product.unit} en stock)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quantité par portion</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unité</Label>
                        <Select value={unit} onValueChange={setUnit}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="pièce">pièce</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleAddIngredient}
                      disabled={!selectedProduct || !quantity || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Ajout..." : "Ajouter"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {recipe.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun ingrédient dans cette fiche technique</p>
                <p className="text-sm">Ajoutez des ingrédients pour calculer les coûts automatiquement</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingrédient</TableHead>
                    <TableHead className="text-right">Qté/portion</TableHead>
                    <TableHead className="text-right">Stock actuel</TableHead>
                    <TableHead className="text-right">Coût unitaire</TableHead>
                    <TableHead className="text-right">Coût total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {recipe.map((ing) => {
                    const stockUnit = ing.stock_product?.unit || ing.unit;
                    const costPerUnit = ing.stock_product?.cost_per_unit || 0;
                    // Convert to stock unit for accurate cost calculation
                    const convertedQty = convertUnit(ing.quantity, ing.unit, stockUnit);
                    const totalCost = convertedQty * costPerUnit;
                    const conversionDisplay = getConversionDisplay(ing.quantity, ing.unit, stockUnit);
                    const isLowStock = ing.stock_product && ing.stock_product.current_stock < convertedQty;
                    const isOutOfStock = ing.stock_product && ing.stock_product.current_stock <= 0;
                    const unitsCompatible = areUnitsCompatible(ing.unit, stockUnit);

                    return (
                      <TableRow key={ing.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {ing.stock_product?.name || "Inconnu"}
                            {isOutOfStock && (
                              <Badge variant="destructive" className="text-xs">Rupture</Badge>
                            )}
                            {isLowStock && !isOutOfStock && (
                              <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                                Stock bas
                              </Badge>
                            )}
                            {!unitsCompatible && (
                              <Badge variant="outline" className="text-xs text-destructive border-destructive">
                                Unités incompatibles
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={ing.quantity}
                                onChange={(e) => handleUpdateQuantity(ing, parseFloat(e.target.value))}
                                className="w-20 text-right"
                              />
                              <span className="text-muted-foreground text-sm w-12">{ing.unit}</span>
                            </div>
                            {conversionDisplay && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <ArrowRight size={10} />
                                {conversionDisplay}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right ${isLowStock ? 'text-destructive' : ''}`}>
                          {ing.stock_product?.current_stock.toLocaleString()} {ing.stock_product?.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {costPerUnit.toLocaleString()} FCFA/{stockUnit}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {totalCost.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIngredient(ing.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
