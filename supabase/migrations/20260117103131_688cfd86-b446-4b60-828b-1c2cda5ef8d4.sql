-- Create sellers table
CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  gst_number TEXT,
  payment_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price_per_piece NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  notes TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  price_per_piece NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create returns table
CREATE TABLE public.returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  price_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company settings table (singleton pattern)
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'WorldWave',
  gst_number TEXT,
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create public access policies (no auth required for this billing app)
CREATE POLICY "Allow public read sellers" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Allow public insert sellers" ON public.sellers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update sellers" ON public.sellers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete sellers" ON public.sellers FOR DELETE USING (true);

CREATE POLICY "Allow public read categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert categories" ON public.product_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update categories" ON public.product_categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete categories" ON public.product_categories FOR DELETE USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Allow public read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update order_items" ON public.order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete order_items" ON public.order_items FOR DELETE USING (true);

CREATE POLICY "Allow public read returns" ON public.returns FOR SELECT USING (true);
CREATE POLICY "Allow public insert returns" ON public.returns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update returns" ON public.returns FOR UPDATE USING (true);
CREATE POLICY "Allow public delete returns" ON public.returns FOR DELETE USING (true);

CREATE POLICY "Allow public read settings" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert settings" ON public.company_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update settings" ON public.company_settings FOR UPDATE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default company settings
INSERT INTO public.company_settings (company_name, gst_number, currency_symbol) VALUES ('WorldWave', '', '₹');

-- Insert default product categories
INSERT INTO public.product_categories (name, price_per_piece) VALUES 
  ('Hoodie', 230),
  ('Half-sleeve Shirt', 130),
  ('Double-pocket Shirt', 160),
  ('Full-sleeve Shirt', 150);