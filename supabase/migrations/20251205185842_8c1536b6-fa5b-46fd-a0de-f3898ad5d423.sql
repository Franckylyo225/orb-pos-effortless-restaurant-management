-- =====================
-- MENU TABLES
-- =====================

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN DEFAULT true,
  cost_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- STOCK TABLES
-- =====================

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stock products table
CREATE TABLE public.stock_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'unité',
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock_threshold DECIMAL(10,2) DEFAULT 5,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stock movements table (for tracking stock changes)
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.stock_products(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- ENABLE RLS
-- =====================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS POLICIES FOR CATEGORIES
-- =====================
CREATE POLICY "Users can view categories of their restaurant"
ON public.categories FOR SELECT
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can insert categories to their restaurant"
ON public.categories FOR INSERT
WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can update categories of their restaurant"
ON public.categories FOR UPDATE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can delete categories of their restaurant"
ON public.categories FOR DELETE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

-- =====================
-- RLS POLICIES FOR MENU ITEMS
-- =====================
CREATE POLICY "Users can view menu items of their restaurant"
ON public.menu_items FOR SELECT
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can insert menu items to their restaurant"
ON public.menu_items FOR INSERT
WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can update menu items of their restaurant"
ON public.menu_items FOR UPDATE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can delete menu items of their restaurant"
ON public.menu_items FOR DELETE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

-- =====================
-- RLS POLICIES FOR SUPPLIERS
-- =====================
CREATE POLICY "Users can view suppliers of their restaurant"
ON public.suppliers FOR SELECT
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can insert suppliers to their restaurant"
ON public.suppliers FOR INSERT
WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can update suppliers of their restaurant"
ON public.suppliers FOR UPDATE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can delete suppliers of their restaurant"
ON public.suppliers FOR DELETE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

-- =====================
-- RLS POLICIES FOR STOCK PRODUCTS
-- =====================
CREATE POLICY "Users can view stock products of their restaurant"
ON public.stock_products FOR SELECT
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can insert stock products to their restaurant"
ON public.stock_products FOR INSERT
WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can update stock products of their restaurant"
ON public.stock_products FOR UPDATE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can delete stock products of their restaurant"
ON public.stock_products FOR DELETE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

-- =====================
-- RLS POLICIES FOR STOCK MOVEMENTS
-- =====================
CREATE POLICY "Users can view stock movements of their restaurant"
ON public.stock_movements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stock_products sp
    WHERE sp.id = stock_movements.product_id
    AND sp.restaurant_id = public.get_user_restaurant_id(auth.uid())
  )
);

CREATE POLICY "Users can insert stock movements for their restaurant"
ON public.stock_movements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stock_products sp
    WHERE sp.id = stock_movements.product_id
    AND sp.restaurant_id = public.get_user_restaurant_id(auth.uid())
  )
);

-- =====================
-- UPDATE TRIGGERS
-- =====================
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_products_updated_at
  BEFORE UPDATE ON public.stock_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- INDEXES FOR PERFORMANCE
-- =====================
CREATE INDEX idx_categories_restaurant ON public.categories(restaurant_id);
CREATE INDEX idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_suppliers_restaurant ON public.suppliers(restaurant_id);
CREATE INDEX idx_stock_products_restaurant ON public.stock_products(restaurant_id);
CREATE INDEX idx_stock_movements_product ON public.stock_movements(product_id);