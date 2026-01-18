import { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, Pencil } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useCreateOrder, useDeleteOrder, useUpdateOrder } from '@/hooks/useOrders';
import { useSellers } from '@/hooks/useSellers';
import { useCategories } from '@/hooks/useCategories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface OrderFormData {
  id?: string;
  selectedSeller: string;
  orderDate: string;
  notes: string;
  orderItems: { categoryId: string; quantity: number }[];
}

const initialFormData: OrderFormData = {
  selectedSeller: '',
  orderDate: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
  orderItems: [{ categoryId: '', quantity: 0 }],
};

export default function Orders() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  const queryClient = useQueryClient();
  const { data: sellers } = useSellers();
  const { data: categories } = useCategories();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const { data: ordersWithItems, isLoading } = useQuery({
    queryKey: ['orders-with-items'],
    queryFn: async () => {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, sellers(*)')
        .order('order_date', { ascending: false });
      if (ordersError) throw ordersError;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*, product_categories(*)');
      if (itemsError) throw itemsError;

      return orders.map((order) => ({
        ...order,
        items: items.filter((item) => item.order_id === order.id),
      }));
    },
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (order: any) => {
    setFormData({
      id: order.id,
      selectedSeller: order.seller_id,
      orderDate: order.order_date,
      notes: order.notes || '',
      orderItems: order.items.map((item: any) => ({
        categoryId: item.category_id,
        quantity: item.quantity,
      })),
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const addOrderItem = () => {
    setFormData({
      ...formData,
      orderItems: [...formData.orderItems, { categoryId: '', quantity: 0 }],
    });
  };

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const updated = [...formData.orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, orderItems: updated });
  };

  const removeOrderItem = (index: number) => {
    if (formData.orderItems.length > 1) {
      setFormData({
        ...formData,
        orderItems: formData.orderItems.filter((_, i) => i !== index),
      });
    }
  };

  const getItemSubtotal = (item: { categoryId: string; quantity: number }) => {
    const category = categories?.find((c) => c.id === item.categoryId);
    return category ? Number(category.price_per_piece) * item.quantity : 0;
  };

  const getOrderTotal = () => {
    return formData.orderItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  };

  const handleSubmit = async () => {
    if (!formData.selectedSeller || formData.orderItems.some((item) => !item.categoryId || item.quantity <= 0)) {
      return;
    }

    const items = formData.orderItems.map((item) => {
      const category = categories?.find((c) => c.id === item.categoryId);
      return {
        category_id: item.categoryId,
        quantity: item.quantity,
        price_per_piece: Number(category?.price_per_piece || 0),
        subtotal: getItemSubtotal(item),
      };
    });

    const orderData = {
      order_date: formData.orderDate,
      seller_id: formData.selectedSeller,
      notes: formData.notes || undefined,
      total_amount: getOrderTotal(),
    };

    if (isEditing && formData.id) {
      await updateOrder.mutateAsync({ orderId: formData.id, order: orderData, items });
    } else {
      await createOrder.mutateAsync({ order: orderData, items });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage your daily orders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="group transition-all duration-200 hover:scale-105">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Order' : 'Add New Order'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Seller</Label>
                  <Select value={formData.selectedSeller} onValueChange={(val) => setFormData({ ...formData, selectedSeller: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seller" />
                    </SelectTrigger>
                    <SelectContent>
                      {sellers?.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id}>
                          {seller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Products</Label>
                <div className="space-y-3">
                  {formData.orderItems.map((item, index) => {
                    const category = categories?.find((c) => c.id === item.categoryId);
                    return (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-center p-3 bg-muted rounded-md animate-fade-in"
                      >
                        <div className="col-span-4">
                          <Select
                            value={item.categoryId}
                            onValueChange={(val) => updateOrderItem(index, 'categoryId', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {category ? `₹${category.price_per_piece}/pc` : '-'}
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            min={0}
                            value={item.quantity || ''}
                            onChange={(e) =>
                              updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="col-span-3 text-sm font-medium text-right">
                          ₹{getItemSubtotal(item).toLocaleString()}
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrderItem(index)}
                            className="text-destructive hover:text-destructive transition-transform hover:scale-110"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={addOrderItem} className="transition-all hover:scale-105">
                  <Plus className="mr-2 h-3 w-3" />
                  Add Product
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any notes for this order..."
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Order Total</span>
                <span className="text-xl font-bold text-primary">
                  ₹{getOrderTotal().toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createOrder.isPending || updateOrder.isPending}>
                  {(createOrder.isPending || updateOrder.isPending) ? 'Saving...' : isEditing ? 'Update Order' : 'Save Order'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-md border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
        ) : ordersWithItems?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No orders yet. Click "Add Order" to create one.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Seller</th>
                <th>Items</th>
                <th className="numeric">Total Pieces</th>
                <th className="numeric">Amount</th>
                <th>Notes</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersWithItems?.map((order) => (
                <tr key={order.id} className="group">
                  <td>{format(new Date(order.order_date), 'dd MMM yyyy')}</td>
                  <td className="font-medium">{order.sellers?.name}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {order.items.map((item: any, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted"
                        >
                          {item.product_categories?.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="numeric">
                    {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                  </td>
                  <td className="numeric font-semibold">
                    ₹{Number(order.total_amount).toLocaleString()}
                  </td>
                  <td className="text-muted-foreground text-sm">{order.notes || '-'}</td>
                  <td>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(order)}
                        className="text-primary hover:text-primary transition-transform hover:scale-110"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteOrder.mutate(order.id)}
                        className="text-destructive hover:text-destructive transition-transform hover:scale-110"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
