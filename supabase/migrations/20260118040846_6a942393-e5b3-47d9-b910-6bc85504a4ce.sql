-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add user_id column to all existing tables
ALTER TABLE public.sellers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.product_categories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.returns ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.company_settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old public policies and create user-specific ones
DROP POLICY IF EXISTS "Allow public read sellers" ON public.sellers;
DROP POLICY IF EXISTS "Allow public insert sellers" ON public.sellers;
DROP POLICY IF EXISTS "Allow public update sellers" ON public.sellers;
DROP POLICY IF EXISTS "Allow public delete sellers" ON public.sellers;

CREATE POLICY "Users can view own sellers" ON public.sellers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sellers" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sellers" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sellers" ON public.sellers FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow public insert categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow public update categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow public delete categories" ON public.product_categories;

CREATE POLICY "Users can view own categories" ON public.product_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.product_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.product_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.product_categories FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public delete orders" ON public.orders;

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own orders" ON public.orders FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public update order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public delete order_items" ON public.order_items;

CREATE POLICY "Users can view own order_items" ON public.order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can insert own order_items" ON public.order_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can update own order_items" ON public.order_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can delete own order_items" ON public.order_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow public read returns" ON public.returns;
DROP POLICY IF EXISTS "Allow public insert returns" ON public.returns;
DROP POLICY IF EXISTS "Allow public update returns" ON public.returns;
DROP POLICY IF EXISTS "Allow public delete returns" ON public.returns;

CREATE POLICY "Users can view own returns" ON public.returns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own returns" ON public.returns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own returns" ON public.returns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own returns" ON public.returns FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read settings" ON public.company_settings;
DROP POLICY IF EXISTS "Allow public insert settings" ON public.company_settings;
DROP POLICY IF EXISTS "Allow public update settings" ON public.company_settings;

CREATE POLICY "Users can view own settings" ON public.company_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.company_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.company_settings FOR UPDATE USING (auth.uid() = user_id);

-- Function to create profile and default data on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.company_settings (user_id, company_name, currency_symbol)
  VALUES (NEW.id, 'My Company', '₹');
  
  -- Insert default categories
  INSERT INTO public.product_categories (user_id, name, price_per_piece) VALUES
    (NEW.id, 'Polo T-Shirt', 180),
    (NEW.id, 'Round Neck T-Shirt', 150),
    (NEW.id, 'Formal Shirt', 250),
    (NEW.id, 'Jeans', 450);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();