import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useToast } from "@/hooks/use-toast";

export interface RecipeIngredient {
  id: string;
  menu_item_id: string;
  stock_product_id: string;
  quantity: number;
  unit: string;
  notes: string | null;
  stock_product?: {
    id: string;
    name: string;
    unit: string;
    current_stock: number;
    cost_per_unit: number;
    min_stock_threshold: number;
  };
}

export interface RecipeWithCost {
  menu_item_id: string;
  ingredients: RecipeIngredient[];
  total_cost: number;
  selling_price: number;
  margin: number;
  margin_percent: number;
}

export function useRecipes() {
  const { restaurant } = useRestaurant();
  const [recipes, setRecipes] = useState<Map<string, RecipeIngredient[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecipes = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("recipe_ingredients")
      .select(`
        *,
        stock_product:stock_products(id, name, unit, current_stock, cost_per_unit, min_stock_threshold),
        menu_item:menu_items!inner(restaurant_id)
      `)
      .eq("menu_item.restaurant_id", restaurant.id);

    if (error) {
      console.error("Error fetching recipes:", error);
    } else {
      const recipeMap = new Map<string, RecipeIngredient[]>();
      (data || []).forEach((item: any) => {
        const existing = recipeMap.get(item.menu_item_id) || [];
        existing.push({
          id: item.id,
          menu_item_id: item.menu_item_id,
          stock_product_id: item.stock_product_id,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
          stock_product: item.stock_product,
        });
        recipeMap.set(item.menu_item_id, existing);
      });
      setRecipes(recipeMap);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRecipes();
  }, [restaurant?.id]);

  const getRecipeForItem = (menuItemId: string): RecipeIngredient[] => {
    return recipes.get(menuItemId) || [];
  };

  const addIngredientToRecipe = async (data: {
    menu_item_id: string;
    stock_product_id: string;
    quantity: number;
    unit: string;
    notes?: string;
  }) => {
    const { data: newIngredient, error } = await supabase
      .from("recipe_ingredients")
      .insert({
        menu_item_id: data.menu_item_id,
        stock_product_id: data.stock_product_id,
        quantity: data.quantity,
        unit: data.unit,
        notes: data.notes || null,
      })
      .select(`
        *,
        stock_product:stock_products(id, name, unit, current_stock, cost_per_unit, min_stock_threshold)
      `)
      .single();

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    // Update local state
    const existing = recipes.get(data.menu_item_id) || [];
    existing.push({
      id: newIngredient.id,
      menu_item_id: newIngredient.menu_item_id,
      stock_product_id: newIngredient.stock_product_id,
      quantity: newIngredient.quantity,
      unit: newIngredient.unit,
      notes: newIngredient.notes,
      stock_product: newIngredient.stock_product as any,
    });
    setRecipes(new Map(recipes.set(data.menu_item_id, existing)));

    toast({ title: "Ingrédient ajouté à la fiche technique" });
    return { error: null, ingredient: newIngredient };
  };

  const updateIngredient = async (id: string, menuItemId: string, data: Partial<RecipeIngredient>) => {
    const { error } = await supabase
      .from("recipe_ingredients")
      .update({
        quantity: data.quantity,
        unit: data.unit,
        notes: data.notes,
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    // Update local state
    const existing = recipes.get(menuItemId) || [];
    const updated = existing.map((ing) =>
      ing.id === id ? { ...ing, ...data } : ing
    );
    setRecipes(new Map(recipes.set(menuItemId, updated)));

    toast({ title: "Ingrédient mis à jour" });
    return { error: null };
  };

  const removeIngredientFromRecipe = async (id: string, menuItemId: string) => {
    const { error } = await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    // Update local state
    const existing = recipes.get(menuItemId) || [];
    const filtered = existing.filter((ing) => ing.id !== id);
    if (filtered.length > 0) {
      setRecipes(new Map(recipes.set(menuItemId, filtered)));
    } else {
      const newMap = new Map(recipes);
      newMap.delete(menuItemId);
      setRecipes(newMap);
    }

    toast({ title: "Ingrédient retiré" });
    return { error: null };
  };

  const calculateRecipeCost = (menuItemId: string): number => {
    const ingredients = recipes.get(menuItemId) || [];
    return ingredients.reduce((sum, ing) => {
      const costPerUnit = ing.stock_product?.cost_per_unit || 0;
      return sum + ing.quantity * costPerUnit;
    }, 0);
  };

  const getRecipeWithCost = (menuItemId: string, sellingPrice: number): RecipeWithCost => {
    const ingredients = getRecipeForItem(menuItemId);
    const totalCost = calculateRecipeCost(menuItemId);
    const margin = sellingPrice - totalCost;
    const marginPercent = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;

    return {
      menu_item_id: menuItemId,
      ingredients,
      total_cost: totalCost,
      selling_price: sellingPrice,
      margin,
      margin_percent: marginPercent,
    };
  };

  const decrementStockOnSale = async (orderId: string, userId?: string) => {
    const { data, error } = await supabase.rpc("decrement_stock_on_sale", {
      p_order_id: orderId,
      p_user_id: userId || null,
    });

    if (error) {
      console.error("Error decrementing stock:", error);
      return { error };
    }

    return { error: null, result: data };
  };

  const checkStockAvailability = async () => {
    const { data, error } = await supabase.rpc("check_stock_availability");

    if (error) {
      console.error("Error checking stock:", error);
      return { error };
    }

    const result = data as { disabled: number; enabled: number } | null;
    if (result && (result.disabled > 0 || result.enabled > 0)) {
      toast({
        title: "Disponibilité mise à jour",
        description: `${result.disabled} plat(s) désactivé(s), ${result.enabled} plat(s) réactivé(s)`,
      });
    }

    return { error: null, result };
  };

  return {
    recipes,
    loading,
    getRecipeForItem,
    addIngredientToRecipe,
    updateIngredient,
    removeIngredientFromRecipe,
    calculateRecipeCost,
    getRecipeWithCost,
    decrementStockOnSale,
    checkStockAvailability,
    refetch: fetchRecipes,
  };
}
