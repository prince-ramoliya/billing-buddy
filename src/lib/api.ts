import { supabase } from '@/integrations/supabase/client';

export interface Seller {
  id: string;
  name: string;
  contact: string | null;
  gst_number: string | null;
  payment_notes: string | null;
  is_active: boolean;
  created_at: string;
  user_id?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  price_per_piece: number;
  is_active: boolean;
  user_id?: string;
}

export interface Order {
  id: string;
  order_date: string;
  seller_id: string;
  notes: string | null;
  total_amount: number;
  created_at: string;
  user_id?: string;
  sellers?: Seller;
}

export interface OrderItem {
  id: string;
  order_id: string;
  category_id: string;
  quantity: number;
  price_per_piece: number;
  subtotal: number;
  product_categories?: ProductCategory;
}

export interface Return {
  id: string;
  return_date: string;
  seller_id: string;
  category_id: string;
  quantity: number;
  price_per_unit: number;
  total_deduction: number;
  reason: string | null;
  created_at: string;
  user_id?: string;
  sellers?: Seller;
  product_categories?: ProductCategory;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  gst_number: string | null;
  currency_symbol: string;
  user_id?: string;
}

// Helper to get current user ID
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// Sellers API
export const sellersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Seller[];
  },

  async create(seller: Omit<Seller, 'id' | 'created_at' | 'user_id'>) {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('sellers')
      .insert({ ...seller, user_id })
      .select()
      .single();
    if (error) throw error;
    return data as Seller;
  },

  async update(id: string, seller: Partial<Seller>) {
    const { data, error } = await supabase
      .from('sellers')
      .update(seller)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Seller;
  },

  async delete(id: string) {
    const { error } = await supabase.from('sellers').delete().eq('id', id);
    if (error) throw error;
  },
};

// Categories API
export const categoriesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as ProductCategory[];
  },

  async create(category: Omit<ProductCategory, 'id' | 'user_id'>) {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('product_categories')
      .insert({ ...category, user_id })
      .select()
      .single();
    if (error) throw error;
    return data as ProductCategory;
  },

  async update(id: string, category: Partial<ProductCategory>) {
    const { data, error } = await supabase
      .from('product_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ProductCategory;
  },

  async delete(id: string) {
    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    if (error) throw error;
  },
};

// Orders API
export const ordersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, sellers(*)')
      .order('order_date', { ascending: false });
    if (error) throw error;
    return data as Order[];
  },

  async getWithItems(orderId: string) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, sellers(*)')
      .eq('id', orderId)
      .single();
    if (orderError) throw orderError;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, product_categories(*)')
      .eq('order_id', orderId);
    if (itemsError) throw itemsError;

    return { order: order as Order, items: items as OrderItem[] };
  },

  async create(
    order: { order_date: string; seller_id: string; notes?: string; total_amount: number },
    items: { category_id: string; quantity: number; price_per_piece: number; subtotal: number }[]
  ) {
    const user_id = await getCurrentUserId();
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({ ...order, user_id })
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return newOrder as Order;
  },

  async update(
    orderId: string,
    order: { order_date: string; seller_id: string; notes?: string; total_amount: number },
    items: { category_id: string; quantity: number; price_per_piece: number; subtotal: number }[]
  ) {
    // Update order
    const { data: updatedOrder, error: orderError } = await supabase
      .from('orders')
      .update(order)
      .eq('id', orderId)
      .select()
      .single();
    if (orderError) throw orderError;

    // Delete existing items and insert new ones
    await supabase.from('order_items').delete().eq('order_id', orderId);

    const orderItems = items.map((item) => ({
      ...item,
      order_id: orderId,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return updatedOrder as Order;
  },

  async delete(id: string) {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  },
};

// Returns API
export const returnsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('returns')
      .select('*, sellers(*), product_categories(*)')
      .order('return_date', { ascending: false });
    if (error) throw error;
    return data as Return[];
  },

  async create(returnData: Omit<Return, 'id' | 'created_at' | 'sellers' | 'product_categories' | 'user_id'>) {
    const user_id = await getCurrentUserId();
    const { data, error } = await supabase
      .from('returns')
      .insert({ ...returnData, user_id })
      .select()
      .single();
    if (error) throw error;
    return data as Return;
  },

  async update(id: string, returnData: Partial<Return>) {
    const { data, error } = await supabase
      .from('returns')
      .update(returnData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Return;
  },

  async delete(id: string) {
    const { error } = await supabase.from('returns').delete().eq('id', id);
    if (error) throw error;
  },
};

// Company Settings API
export const settingsApi = {
  async get() {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as CompanySettings | null;
  },

  async update(settings: Partial<CompanySettings>) {
    const user_id = await getCurrentUserId();
    const existing = await settingsApi.get();
    if (existing) {
      const { data, error } = await supabase
        .from('company_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as CompanySettings;
    } else {
      const { data, error } = await supabase
        .from('company_settings')
        .insert({ ...settings, user_id })
        .select()
        .single();
      if (error) throw error;
      return data as CompanySettings;
    }
  },
};

// Dashboard Stats
export const dashboardApi = {
  async getStats() {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0];

    // Get today's orders count
    const { count: todaysOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_date', today);

    // Get all orders for the month with items
    const { data: monthlyOrders } = await supabase
      .from('orders')
      .select('*, sellers(*)')
      .gte('order_date', startOfMonth);

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, product_categories(*)');

    // Get monthly returns
    const { data: monthlyReturns } = await supabase
      .from('returns')
      .select('*')
      .gte('return_date', startOfMonth);

    const totalMonthlyAmount = monthlyOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const totalReturns = monthlyReturns?.reduce((sum, r) => sum + Number(r.total_deduction), 0) || 0;
    const monthlyPieces = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    // Calculate top seller
    const sellerVolume: Record<string, { name: string; amount: number }> = {};
    monthlyOrders?.forEach((order) => {
      const sellerName = order.sellers?.name || 'Unknown';
      if (!sellerVolume[order.seller_id]) {
        sellerVolume[order.seller_id] = { name: sellerName, amount: 0 };
      }
      sellerVolume[order.seller_id].amount += Number(order.total_amount);
    });

    const topSeller = Object.values(sellerVolume).sort((a, b) => b.amount - a.amount)[0] || null;

    return {
      todaysOrders: todaysOrders || 0,
      monthlyPieces,
      monthlyPayable: totalMonthlyAmount - totalReturns,
      topSeller,
      totalMonthlyAmount,
      totalReturns,
    };
  },

  async getChartData() {
    const { data: orders } = await supabase
      .from('orders')
      .select('*, sellers(*)')
      .order('order_date', { ascending: true })
      .limit(30);

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, product_categories(*)');

    const { data: returns } = await supabase.from('returns').select('*');

    // Orders over time
    const ordersOverTime = orders?.reduce((acc, order) => {
      const date = new Date(order.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.orders++;
        existing.amount += Number(order.total_amount);
      } else {
        acc.push({ date, orders: 1, amount: Number(order.total_amount) });
      }
      return acc;
    }, [] as { date: string; orders: number; amount: number }[]) || [];

    // Pieces by category
    const categoryPieces: Record<string, number> = {};
    orderItems?.forEach((item) => {
      const name = item.product_categories?.name || 'Unknown';
      categoryPieces[name] = (categoryPieces[name] || 0) + item.quantity;
    });

    const piecesByCategory = Object.entries(categoryPieces).map(([category, pieces], index) => ({
      category,
      pieces,
      fill: `hsl(var(--chart-${(index % 6) + 1}))`,
    }));

    // Revenue by supplier
    const supplierRevenue: Record<string, { revenue: number; returns: number }> = {};
    orders?.forEach((order) => {
      const name = order.sellers?.name || 'Unknown';
      if (!supplierRevenue[name]) {
        supplierRevenue[name] = { revenue: 0, returns: 0 };
      }
      supplierRevenue[name].revenue += Number(order.total_amount);
    });

    const revenueBySupplier = Object.entries(supplierRevenue).map(([seller, data]) => ({
      seller,
      revenue: data.revenue,
      returns: data.returns,
    }));

    return {
      ordersOverTime,
      piecesByCategory,
      revenueBySupplier,
    };
  },
};
