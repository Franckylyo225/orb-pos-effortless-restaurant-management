import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  variants: Json;
  is_available: boolean;
  cost_price: number;
  category?: Category | null;
}

export function useMenu() {
  const { restaurant } = useRestaurant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order");

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
    } else {
      setCategories(categoriesData || []);
    }

    // Fetch menu items with categories
    const { data: itemsData, error: itemsError } = await supabase
      .from("menu_items")
      .select("*, category:categories(*)")
      .eq("restaurant_id", restaurant.id)
      .order("name");

    if (itemsError) {
      console.error("Error fetching menu items:", itemsError);
    } else {
      setMenuItems(itemsData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [restaurant?.id]);

  const addCategory = async (data: { name: string; description?: string }) => {
    if (!restaurant?.id) return { error: new Error("No restaurant") };

    const { data: newCategory, error } = await supabase
      .from("categories")
      .insert({
        restaurant_id: restaurant.id,
        name: data.name,
        description: data.description || null,
        sort_order: categories.length,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setCategories((prev) => [...prev, newCategory]);
    toast({ title: "Catégorie ajoutée" });
    return { error: null, category: newCategory };
  };

  const addMenuItem = async (data: {
    name: string;
    description?: string;
    price: number;
    category_id?: string;
    cost_price?: number;
    variants?: any[];
  }) => {
    if (!restaurant?.id) return { error: new Error("No restaurant") };

    const { data: newItem, error } = await supabase
      .from("menu_items")
      .insert({
        restaurant_id: restaurant.id,
        name: data.name,
        description: data.description || null,
        price: data.price,
        category_id: data.category_id || null,
        cost_price: data.cost_price || 0,
        variants: data.variants || [],
        is_available: true,
      })
      .select("*, category:categories(*)")
      .single();

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setMenuItems((prev) => [...prev, newItem]);
    toast({ title: "Plat ajouté" });
    return { error: null, item: newItem };
  };

  const updateMenuItem = async (id: string, data: Partial<MenuItem>) => {
    const { error } = await supabase
      .from("menu_items")
      .update(data)
      .eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    return { error: null };
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    toast({ title: "Plat supprimé" });
    return { error: null };
  };

  const toggleAvailability = async (id: string, is_available: boolean) => {
    return updateMenuItem(id, { is_available });
  };

  return {
    categories,
    menuItems,
    loading,
    addCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    refetch: fetchData,
  };
}
