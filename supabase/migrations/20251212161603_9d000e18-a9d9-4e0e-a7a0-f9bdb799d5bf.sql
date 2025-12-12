-- Create super_admins table to store super admin users
CREATE TABLE public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can view the super_admins table
CREATE POLICY "Super admins can view super_admins" 
ON public.super_admins 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.super_admins
    WHERE user_id = _user_id
  )
$$;

-- Create a view for SaaS analytics (accessible only by super admins)
CREATE OR REPLACE VIEW public.saas_restaurant_stats AS
SELECT 
  r.id,
  r.name,
  r.subscription_plan,
  r.created_at,
  r.email,
  r.phone,
  r.team_size,
  (SELECT COUNT(*) FROM public.orders o WHERE o.restaurant_id = r.id) as total_orders,
  (SELECT COUNT(*) FROM public.menu_items m WHERE m.restaurant_id = r.id) as total_menu_items,
  (SELECT COUNT(*) FROM public.tables t WHERE t.restaurant_id = r.id) as total_tables,
  (SELECT COALESCE(SUM(o.total), 0) FROM public.orders o WHERE o.restaurant_id = r.id AND o.status = 'paid') as total_revenue
FROM public.restaurants r;

-- RLS policy for the view (only super admins)
ALTER VIEW public.saas_restaurant_stats SET (security_invoker = on);

-- Create policy for restaurants table to allow super admins to view all
CREATE POLICY "Super admins can view all restaurants" 
ON public.restaurants 
FOR SELECT 
USING (is_super_admin(auth.uid()));