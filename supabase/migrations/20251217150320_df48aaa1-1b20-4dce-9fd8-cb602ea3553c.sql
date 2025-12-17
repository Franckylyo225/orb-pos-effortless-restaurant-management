-- Function to convert between compatible units
CREATE OR REPLACE FUNCTION public.convert_unit(
  p_quantity NUMERIC,
  p_from_unit TEXT,
  p_to_unit TEXT
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- Same unit, no conversion needed
  IF p_from_unit = p_to_unit THEN
    RETURN p_quantity;
  END IF;
  
  -- Mass conversions: g <-> kg
  IF p_from_unit = 'g' AND p_to_unit = 'kg' THEN
    RETURN p_quantity / 1000;
  END IF;
  IF p_from_unit = 'kg' AND p_to_unit = 'g' THEN
    RETURN p_quantity * 1000;
  END IF;
  
  -- Volume conversions: ml <-> L
  IF p_from_unit = 'ml' AND p_to_unit = 'L' THEN
    RETURN p_quantity / 1000;
  END IF;
  IF p_from_unit = 'L' AND p_to_unit = 'ml' THEN
    RETURN p_quantity * 1000;
  END IF;
  
  -- Incompatible units, return original (will cause incorrect calculation but prevents errors)
  RETURN p_quantity;
END;
$$;

-- Update calculate_recipe_cost to use unit conversion
CREATE OR REPLACE FUNCTION public.calculate_recipe_cost(p_menu_item_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(
    convert_unit(ri.quantity, ri.unit, sp.unit) * sp.cost_per_unit
  ), 0)
  FROM recipe_ingredients ri
  JOIN stock_products sp ON sp.id = ri.stock_product_id
  WHERE ri.menu_item_id = p_menu_item_id;
$$;

-- Update decrement_stock_on_sale to use unit conversion
CREATE OR REPLACE FUNCTION public.decrement_stock_on_sale(p_order_id uuid, p_user_id uuid DEFAULT NULL::uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_item RECORD;
  v_recipe RECORD;
  v_new_stock NUMERIC;
  v_converted_qty NUMERIC;
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
      SELECT ri.stock_product_id, ri.quantity as recipe_qty, ri.unit as recipe_unit,
             sp.current_stock, sp.min_stock_threshold, sp.name as product_name, sp.unit as stock_unit
      FROM recipe_ingredients ri
      JOIN stock_products sp ON sp.id = ri.stock_product_id
      WHERE ri.menu_item_id = v_order_item.menu_item_id
    LOOP
      -- Convert recipe quantity to stock unit
      v_converted_qty := convert_unit(v_recipe.recipe_qty, v_recipe.recipe_unit, v_recipe.stock_unit);
      
      -- Calculate new stock
      v_new_stock := v_recipe.current_stock - (v_converted_qty * v_order_item.quantity);
      
      -- Update stock
      UPDATE stock_products 
      SET current_stock = v_new_stock,
          updated_at = now()
      WHERE id = v_recipe.stock_product_id;
      
      -- Record movement with converted quantity
      INSERT INTO stock_movements (product_id, quantity, movement_type, notes, created_by)
      VALUES (
        v_recipe.stock_product_id,
        v_converted_qty * v_order_item.quantity,
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

-- Update check_stock_availability to use unit conversion
CREATE OR REPLACE FUNCTION public.check_stock_availability()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_disabled_count INT := 0;
  v_enabled_count INT := 0;
BEGIN
  -- Disable menu items where any ingredient is out of stock (with unit conversion)
  UPDATE menu_items mi
  SET is_available = false, updated_at = now()
  WHERE mi.is_available = true
  AND EXISTS (
    SELECT 1 
    FROM recipe_ingredients ri
    JOIN stock_products sp ON sp.id = ri.stock_product_id
    WHERE ri.menu_item_id = mi.id
    AND sp.current_stock < convert_unit(ri.quantity, ri.unit, sp.unit)
  );
  
  GET DIAGNOSTICS v_disabled_count = ROW_COUNT;
  
  -- Re-enable menu items where all ingredients are back in stock (with unit conversion)
  UPDATE menu_items mi
  SET is_available = true, updated_at = now()
  WHERE mi.is_available = false
  AND NOT EXISTS (
    SELECT 1 
    FROM recipe_ingredients ri
    JOIN stock_products sp ON sp.id = ri.stock_product_id
    WHERE ri.menu_item_id = mi.id
    AND sp.current_stock < convert_unit(ri.quantity, ri.unit, sp.unit)
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