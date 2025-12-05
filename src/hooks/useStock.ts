import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useToast } from "@/hooks/use-toast";

export interface Supplier {
  id: string;
  restaurant_id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
}

export interface StockProduct {
  id: string;
  restaurant_id: string;
  supplier_id: string | null;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_threshold: number;
  cost_per_unit: number;
  supplier?: Supplier;
}

export interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: "in" | "out" | "adjustment";
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export function useStock() {
  const { restaurant } = useRestaurant();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch suppliers
    const { data: suppliersData, error: suppliersError } = await supabase
      .from("suppliers")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("name");

    if (suppliersError) {
      console.error("Error fetching suppliers:", suppliersError);
    } else {
      setSuppliers(suppliersData || []);
    }

    // Fetch products with suppliers
    const { data: productsData, error: productsError } = await supabase
      .from("stock_products")
      .select("*, supplier:suppliers(*)")
      .eq("restaurant_id", restaurant.id)
      .order("name");

    if (productsError) {
      console.error("Error fetching stock products:", productsError);
    } else {
      setProducts(productsData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [restaurant?.id]);

  const addSupplier = async (data: {
    name: string;
    contact_name?: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => {
    if (!restaurant?.id) return { error: new Error("No restaurant") };

    const { data: newSupplier, error } = await supabase
      .from("suppliers")
      .insert({
        restaurant_id: restaurant.id,
        ...data,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setSuppliers((prev) => [...prev, newSupplier]);
    toast({ title: "Fournisseur ajouté" });
    return { error: null, supplier: newSupplier };
  };

  const addProduct = async (data: {
    name: string;
    unit: string;
    current_stock?: number;
    min_stock_threshold?: number;
    cost_per_unit?: number;
    supplier_id?: string;
  }) => {
    if (!restaurant?.id) return { error: new Error("No restaurant") };

    const { data: newProduct, error } = await supabase
      .from("stock_products")
      .insert({
        restaurant_id: restaurant.id,
        name: data.name,
        unit: data.unit,
        current_stock: data.current_stock || 0,
        min_stock_threshold: data.min_stock_threshold || 5,
        cost_per_unit: data.cost_per_unit || 0,
        supplier_id: data.supplier_id || null,
      })
      .select("*, supplier:suppliers(*)")
      .single();

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setProducts((prev) => [...prev, newProduct]);
    toast({ title: "Produit ajouté" });
    return { error: null, product: newProduct };
  };

  const updateProduct = async (id: string, data: Partial<StockProduct>) => {
    const { error } = await supabase
      .from("stock_products")
      .update(data)
      .eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...data } : product))
    );
    return { error: null };
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("stock_products").delete().eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }

    setProducts((prev) => prev.filter((product) => product.id !== id));
    toast({ title: "Produit supprimé" });
    return { error: null };
  };

  const addStockMovement = async (
    productId: string,
    quantity: number,
    type: "in" | "out" | "adjustment",
    notes?: string
  ) => {
    const { error: movementError } = await supabase
      .from("stock_movements")
      .insert({
        product_id: productId,
        quantity,
        movement_type: type,
        notes: notes || null,
      });

    if (movementError) {
      toast({ title: "Erreur", description: movementError.message, variant: "destructive" });
      return { error: movementError };
    }

    // Update product stock
    const product = products.find((p) => p.id === productId);
    if (product) {
      let newStock = product.current_stock;
      if (type === "in") newStock += quantity;
      else if (type === "out") newStock -= quantity;
      else newStock = quantity; // adjustment sets the new value

      await updateProduct(productId, { current_stock: newStock });
    }

    toast({ title: "Stock mis à jour" });
    return { error: null };
  };

  const lowStockProducts = products.filter(
    (p) => p.current_stock <= p.min_stock_threshold
  );

  return {
    suppliers,
    products,
    lowStockProducts,
    loading,
    addSupplier,
    addProduct,
    updateProduct,
    deleteProduct,
    addStockMovement,
    refetch: fetchData,
  };
}
