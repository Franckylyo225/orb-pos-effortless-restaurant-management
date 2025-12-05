-- =====================
-- TABLES (Restaurant floor)
-- =====================
CREATE TABLE public.tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 4,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  shape TEXT DEFAULT 'square' CHECK (shape IN ('square', 'circle', 'rectangle')),
  status TEXT DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved', 'cleaning')),
  assigned_server_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- ORDERS
-- =====================
CREATE TYPE public.order_status AS ENUM ('pending', 'in_kitchen', 'ready', 'served', 'paid', 'cancelled');

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
  order_number SERIAL,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- ORDER ITEMS
-- =====================
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  variant TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- PAYMENTS
-- =====================
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'mobile_money', 'other');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'refunded', 'failed');

CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  reference TEXT,
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- ENABLE RLS
-- =====================
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS POLICIES FOR TABLES
-- =====================
CREATE POLICY "Users can view tables of their restaurant"
ON public.tables FOR SELECT
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can insert tables to their restaurant"
ON public.tables FOR INSERT
WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can update tables of their restaurant"
ON public.tables FOR UPDATE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can delete tables of their restaurant"
ON public.tables FOR DELETE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

-- =====================
-- RLS POLICIES FOR ORDERS
-- =====================
CREATE POLICY "Users can view orders of their restaurant"
ON public.orders FOR SELECT
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can insert orders to their restaurant"
ON public.orders FOR INSERT
WITH CHECK (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can update orders of their restaurant"
ON public.orders FOR UPDATE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can delete orders of their restaurant"
ON public.orders FOR DELETE
USING (restaurant_id = public.get_user_restaurant_id(auth.uid()));

-- =====================
-- RLS POLICIES FOR ORDER ITEMS
-- =====================
CREATE POLICY "Users can view order items of their restaurant"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.restaurant_id = public.get_user_restaurant_id(auth.uid())
  )
);

CREATE POLICY "Users can insert order items to their restaurant"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.restaurant_id = public.get_user_restaurant_id(auth.uid())
  )
);

CREATE POLICY "Users can update order items of their restaurant"
ON public.order_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.restaurant_id = public.get_user_restaurant_id(auth.uid())
  )
);

CREATE POLICY "Users can delete order items of their restaurant"
ON public.order_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.restaurant_id = public.get_user_restaurant_id(auth.uid())
  )
);

-- =====================
-- RLS POLICIES FOR PAYMENTS
-- =====================
CREATE POLICY "Users can view payments of their restaurant"
ON public.payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id
    AND o.restaurant_id = public.get_user_restaurant_id(auth.uid())
  )
);

CREATE POLICY "Users can insert payments to their restaurant"
ON public.payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id
    AND o.restaurant_id = public.get_user_restaurant_id(auth.uid())
  )
);

-- =====================
-- TRIGGERS
-- =====================
CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_tables_restaurant ON public.tables(restaurant_id);
CREATE INDEX idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX idx_orders_table ON public.orders(table_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_payments_order ON public.payments(order_id);

-- =====================
-- ENABLE REALTIME FOR ORDERS
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;