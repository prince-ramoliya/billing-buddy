-- Add RLS policy for user_roles table
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Fix search_path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;