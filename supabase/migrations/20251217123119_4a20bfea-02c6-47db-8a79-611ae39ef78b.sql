-- Table for recipe ingredients (links menu items to stock products)
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  stock_product_id UUID REFERENCES public.stock_products(id) ON DELETE CASCADE NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'unité',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(menu_item_id, stock_product_id)
);

-- Enable RLS
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- RLS policies for recipe_ingredients
CREATE POLICY "Users can view recipe ingredients of their restaurant"
ON public.recipe_ingredients FOR SELECT
USING (EXISTS (
  SELECT 1 FROM menu_items mi 
  WHERE mi.id = recipe_ingredients.menu_item_id 
  AND mi.restaurant_id = get_user_restaurant_id(auth.uid())
));

CREATE POLICY "Users can insert recipe ingredients to their restaurant"
ON public.recipe_ingredients FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM menu_items mi 
  WHERE mi.id = recipe_ingredients.menu_item_id 
  AND mi.restaurant_id = get_user_restaurant_id(auth.uid())
));

CREATE POLICY "Users can update recipe ingredients of their restaurant"
ON public.recipe_ingredients FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM menu_items mi 
  WHERE mi.id = recipe_ingredients.menu_item_id 
  AND mi.restaurant_id = get_user_restaurant_id(auth.uid())
));

CREATE POLICY "Users can delete recipe ingredients of their restaurant"
ON public.recipe_ingredients FOR DELETE
USING (EXISTS (
  SELECT 1 FROM menu_items mi 
  WHERE mi.id = recipe_ingredients.menu_item_id 
  AND mi.restaurant_id = get_user_restaurant_id(auth.uid())
));

-- Trigger for updated_at
CREATE TRIGGER update_recipe_ingredients_updated_at
BEFORE UPDATE ON public.recipe_ingredients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to decrement stock when an order is paid
CREATE OR REPLACE FUNCTION public.decrement_stock_on_sale(
  p_order_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_item RECORD;
  v_recipe RECORD;
  v_new_stock NUMERIC;
  v_result JSON;
  v_movements_created INT := 0;
  v_items_disabled INT := 0;
BEGIN
  -- Loop through order items
  FOR v_order_item IN 
    SELECT oi.menu_item_id, oi.quantity, oi.name
    FROM order_items oi
    WHERE oi.order_id = p_order_id AND oi.menu_item_id IS NOT NULL
  LOOP
    -- Loop through recipe ingredients for this menu item
    FOR v_recipe IN
      SELECT ri.stock_product_id, ri.quantity as recipe_qty, ri.unit,
             sp.current_stock, sp.min_stock_threshold, sp.name as product_name
      FROM recipe_ingredients ri
      JOIN stock_products sp ON sp.id = ri.stock_product_id
      WHERE ri.menu_item_id = v_order_item.menu_item_id
    LOOP
      -- Calculate quantity to decrement
      v_new_stock := v_recipe.current_stock - (v_recipe.recipe_qty * v_order_item.quantity);
      
      -- Update stock
      UPDATE stock_products 
      SET current_stock = v_new_stock,
          updated_at = now()
      WHERE id = v_recipe.stock_product_id;
      
      -- Record movement
      INSERT INTO stock_movements (product_id, quantity, movement_type, notes, created_by)
      VALUES (
        v_recipe.stock_product_id,
        v_recipe.recipe_qty * v_order_item.quantity,
        'out',
        'Vente automatique: ' || v_order_item.name || ' x' || v_order_item.quantity,
        p_user_id
      );
      
      v_movements_created := v_movements_created + 1;
      
      -- Check if stock is below threshold and disable affected menu items
      IF v_new_stock <= 0 THEN
        UPDATE menu_items mi
        SET is_available = false, updated_at = now()
        WHERE mi.id IN (
          SELECT DISTINCT ri2.menu_item_id 
          FROM recipe_ingredients ri2 
          WHERE ri2.stock_product_id = v_recipe.stock_product_id
        )
        AND mi.is_available = true;
        
        GET DIAGNOSTICS v_items_disabled = ROW_COUNT;
      END IF;
    END LOOP;
  END LOOP;
  
  v_result := json_build_object(
    'success', true,
    'movements_created', v_movements_created,
    'items_disabled', v_items_disabled
  );
  
  RETURN v_result;
END;
$$;

-- Function to check and disable menu items with insufficient stock
CREATE OR REPLACE FUNCTION public.check_stock_availability()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_disabled_count INT := 0;
  v_enabled_count INT := 0;
BEGIN
  -- Disable menu items where any ingredient is out of stock
  UPDATE menu_items mi
  SET is_available = false, updated_at = now()
  WHERE mi.is_available = true
  AND EXISTS (
    SELECT 1 
    FROM recipe_ingredients ri
    JOIN stock_products sp ON sp.id = ri.stock_product_id
    WHERE ri.menu_item_id = mi.id
    AND sp.current_stock < ri.quantity
  );
  
  GET DIAGNOSTICS v_disabled_count = ROW_COUNT;
  
  -- Re-enable menu items where all ingredients are back in stock
  UPDATE menu_items mi
  SET is_available = true, updated_at = now()
  WHERE mi.is_available = false
  AND NOT EXISTS (
    SELECT 1 
    FROM recipe_ingredients ri
    JOIN stock_products sp ON sp.id = ri.stock_product_id
    WHERE ri.menu_item_id = mi.id
    AND sp.current_stock < ri.quantity
  )
  AND EXISTS (
    SELECT 1 FROM recipe_ingredients ri2 WHERE ri2.menu_item_id = mi.id
  );
  
  GET DIAGNOSTICS v_enabled_count = ROW_COUNT;
  
  RETURN json_build_object(
    'disabled', v_disabled_count,
    'enabled', v_enabled_count
  );
END;
$$;

-- Function to calculate recipe cost
CREATE OR REPLACE FUNCTION public.calculate_recipe_cost(p_menu_item_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(SUM(ri.quantity * sp.cost_per_unit), 0)
  FROM recipe_ingredients ri
  JOIN stock_products sp ON sp.id = ri.stock_product_id
  WHERE ri.menu_item_id = p_menu_item_id;
$$;