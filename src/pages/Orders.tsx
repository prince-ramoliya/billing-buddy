import { useState } from 'react';
import { Plus, Calendar, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { mockOrders, mockSellers, mockCategories } from '@/lib/mockData';
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

export default function Orders() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [orderItems, setOrderItems] = useState([
    { categoryId: '', quantity: 0 },
  ]);

  const addOrderItem = () => {
    setOrderItems([...orderItems, { categoryId: '', quantity: 0 }]);
  };

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const getItemSubtotal = (item: { categoryId: string; quantity: number }) => {
    const category = mockCategories.find((c) => c.id === item.categoryId);
    return category ? category.pricePerPiece * item.quantity : 0;
  };

  const getOrderTotal = () => {
    return orderItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage your daily orders
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Seller</Label>
                  <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seller" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSellers.map((seller) => (
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
                  {orderItems.map((item, index) => {
                    const category = mockCategories.find((c) => c.id === item.categoryId);
                    return (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-center p-3 bg-muted rounded-md"
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
                              {mockCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {category ? `₹${category.pricePerPiece}/pc` : '-'}
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
                            className="text-destructive hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={addOrderItem}>
                  <Plus className="mr-2 h-3 w-3" />
                  Add Product
                </Button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Order Total</span>
                <span className="text-xl font-bold text-primary">
                  ₹{getOrderTotal().toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Save Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Input type="date" className="w-40" />
        </div>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Sellers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sellers</SelectItem>
            {mockSellers.map((seller) => (
              <SelectItem key={seller.id} value={seller.id}>
                {seller.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-md border shadow-sm overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Seller</th>
              <th>Items</th>
              <th className="numeric">Total Pieces</th>
              <th className="numeric">Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id}>
                <td>{format(order.orderDate, 'dd MMM yyyy')}</td>
                <td className="font-medium">{order.sellerName}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted"
                      >
                        {item.categoryName} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="numeric">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="numeric font-semibold">
                  ₹{order.totalAmount.toLocaleString()}
                </td>
                <td className="text-muted-foreground text-sm">
                  {order.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
