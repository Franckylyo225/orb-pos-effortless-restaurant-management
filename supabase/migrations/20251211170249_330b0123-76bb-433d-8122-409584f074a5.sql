-- Add menu customization columns to restaurants table
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS menu_primary_color TEXT DEFAULT '#ea580c',
ADD COLUMN IF NOT EXISTS menu_bg_style TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS menu_show_logo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS menu_show_address BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS menu_show_phone BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS menu_welcome_message TEXT DEFAULT NULL;