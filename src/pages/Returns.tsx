import { useState } from 'react';
import { Plus, AlertCircle, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useReturns, useCreateReturn, useDeleteReturn } from '@/hooks/useReturns';
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
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export default function Returns() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [returnDate, setReturnDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSeller, setSelectedSeller] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');

  const { data: returns, isLoading } = useReturns();
  const { data: sellers } = useSellers();
  const { data: categories } = useCategories();
  const createReturn = useCreateReturn();
  const deleteReturn = useDeleteReturn();

  const selectedCategoryData = categories?.find((c) => c.id === selectedCategory);
  const deductionAmount = selectedCategoryData
    ? Number(selectedCategoryData.price_per_piece) * quantity
    : 0;

  const totalReturns = returns?.reduce((sum, ret) => sum + Number(ret.total_deduction), 0) || 0;

  const handleSubmit = async () => {
    if (!selectedSeller || !selectedCategory || quantity <= 0) return;

    await createReturn.mutateAsync({
      return_date: returnDate,
      seller_id: selectedSeller,
      category_id: selectedCategory,
      quantity,
      price_per_unit: Number(selectedCategoryData?.price_per_piece || 0),
      total_deduction: deductionAmount,
      reason: reason || null,
    });

    setIsAddDialogOpen(false);
    setSelectedSeller('');
    setSelectedCategory('');
    setQuantity(0);
    setReason('');
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Returns</h1>
          <p className="text-muted-foreground mt-1">Track returned items from suppliers</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Return
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Return</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seller</Label>
                  <Select value={selectedSeller} onValueChange={setSelectedSeller}>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} (₹{cat.price_per_piece}/pc)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity Returned</Label>
                  <Input
                    type="number"
                    min={0}
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Defective stitching, Wrong size..."
                />
              </div>

              <div className="flex justify-between items-center p-4 bg-destructive/10 rounded-md">
                <span className="text-sm font-medium text-destructive">Deduction Amount</span>
                <span className="text-lg font-bold text-destructive">
                  -₹{deductionAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createReturn.isPending}>
                  {createReturn.isPending ? 'Saving...' : 'Save Return'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Banner */}
      {totalReturns > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">
              Total Returns This Month: ₹{totalReturns.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {returns?.length || 0} items returned from{' '}
              {new Set(returns?.map((r) => r.seller_id)).size} suppliers
            </p>
          </div>
        </div>
      )}

      {/* Returns Table */}
      <div className="bg-card rounded-md border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading returns...</div>
        ) : returns?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No returns logged. Click "Add Return" to log one.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Seller</th>
                <th>Category</th>
                <th className="numeric">Quantity</th>
                <th className="numeric">Price/Unit</th>
                <th className="numeric">Deduction</th>
                <th>Reason</th>
                <th className="w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns?.map((ret) => (
                <tr key={ret.id}>
                  <td>{format(new Date(ret.return_date), 'dd MMM yyyy')}</td>
                  <td className="font-medium">{ret.sellers?.name}</td>
                  <td>{ret.product_categories?.name}</td>
                  <td className="numeric">{ret.quantity}</td>
                  <td className="numeric">₹{Number(ret.price_per_unit).toLocaleString()}</td>
                  <td className="numeric amount-negative">
                    -₹{Number(ret.total_deduction).toLocaleString()}
                  </td>
                  <td className="text-muted-foreground text-sm">{ret.reason || '-'}</td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteReturn.mutate(ret.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
