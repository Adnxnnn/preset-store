-- ================================================================
-- LUMA PRESET STORE - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  full_description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  compare_at_price NUMERIC(10, 2),
  category TEXT DEFAULT 'Cinematic',
  tags TEXT[] DEFAULT ARRAY['Lightroom', 'Mobile', 'Desktop'],
  before_image_url TEXT,
  after_image_url TEXT NOT NULL,
  gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  preview_video_url TEXT,
  format TEXT DEFAULT '.XMP & .DNG',
  preset_count INTEGER DEFAULT 10,
  compatibility TEXT[] DEFAULT ARRAY['Lightroom Classic (v7.3+)', 'Lightroom CC', 'Lightroom Mobile (iOS & Android)', 'Photoshop Camera Raw'],
  includes TEXT[] DEFAULT ARRAY['10+ Pro Presets (.XMP & .DNG)', 'Step-by-Step PDF Installation Guide', 'Mobile & Desktop Files', 'Lifetime Free Updates'],
  file_url TEXT NOT NULL, -- Path to private ZIP/file in product-files bucket
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sales_count INTEGER DEFAULT 0,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders Table (No customer account required - linked via email & order_id)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_reference TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT DEFAULT 'Guest Customer',
  customer_phone TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_session_id TEXT,
  payment_gateway_order_id TEXT,
  download_token TEXT UNIQUE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  price_at_purchase NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Promo Codes Table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_percentage NUMERIC(5, 2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Admin Users Table (For role verification)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current auth user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND (raw_user_meta_data->>'role' = 'admin' OR email = 'admin@presetstore.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- PRODUCTS POLICIES ---
-- Public can view published products
CREATE POLICY "Public users can view published products"
  ON public.products
  FOR SELECT
  USING (is_published = true);

-- Admins can perform all actions on products
CREATE POLICY "Admins have full access to products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- ORDERS POLICIES ---
-- Only Admins can view/modify orders directly via client
CREATE POLICY "Admins have full access to orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- ORDER ITEMS POLICIES ---
CREATE POLICY "Admins have full access to order items"
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- PROMO CODES POLICIES ---
-- Public can check active promo codes
CREATE POLICY "Public can check active promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (is_active = true);

-- Admins can manage promo codes
CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- ADMIN USERS POLICIES ---
CREATE POLICY "Admins can view admin list"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
