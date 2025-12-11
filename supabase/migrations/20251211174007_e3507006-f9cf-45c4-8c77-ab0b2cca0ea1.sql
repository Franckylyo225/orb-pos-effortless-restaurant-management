-- Create table for mobile money providers
CREATE TABLE public.mobile_money_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mobile_money_providers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view mobile money providers of their restaurant"
  ON public.mobile_money_providers
  FOR SELECT
  USING (restaurant_id = get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can insert mobile money providers to their restaurant"
  ON public.mobile_money_providers
  FOR INSERT
  WITH CHECK (restaurant_id = get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can update mobile money providers of their restaurant"
  ON public.mobile_money_providers
  FOR UPDATE
  USING (restaurant_id = get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can delete mobile money providers of their restaurant"
  ON public.mobile_money_providers
  FOR DELETE
  USING (restaurant_id = get_user_restaurant_id(auth.uid()));