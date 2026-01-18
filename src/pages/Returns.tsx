import { useState } from 'react';
import { Plus, AlertCircle, Trash2, Pencil } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useReturns, useCreateReturn, useDeleteReturn, useUpdateReturn } from '@/hooks/useReturns';
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

interface ReturnFormData {
  id?: string;
  returnDate: string;
  selectedSeller: string;
  selectedCategory: string;
  quantity: number;
  reason: string;
}

const initialFormData: ReturnFormData = {
  returnDate: format(new Date(), 'yyyy-MM-dd'),
  selectedSeller: '',
  selectedCategory: '',
  quantity: 0,
  reason: '',
};

export default function Returns() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ReturnFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  const { data: returns, isLoading } = useReturns();
  const { data: sellers } = useSellers();
  const { data: categories } = useCategories();
  const createReturn = useCreateReturn();
  const updateReturn = useUpdateReturn();
  const deleteReturn = useDeleteReturn();

  const selectedCategoryData = categories?.find((c) => c.id === formData.selectedCategory);
  const deductionAmount = selectedCategoryData
    ? Number(selectedCategoryData.price_per_piece) * formData.quantity
    : 0;

  const totalReturns = returns?.reduce((sum, ret) => sum + Number(ret.total_deduction), 0) || 0;

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (ret: any) => {
    setFormData({
      id: ret.id,
      returnDate: ret.return_date,
      selectedSeller: ret.seller_id,
      selectedCategory: ret.category_id,
      quantity: ret.quantity,
      reason: ret.reason || '',
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.selectedSeller || !formData.selectedCategory || formData.quantity <= 0) return;

    const returnData = {
      return_date: formData.returnDate,
      seller_id: formData.selectedSeller,
      category_id: formData.selectedCategory,
      quantity: formData.quantity,
      price_per_unit: Number(selectedCategoryData?.price_per_piece || 0),
      total_deduction: deductionAmount,
      reason: formData.reason || null,
    };

    if (isEditing && formData.id) {
      await updateReturn.mutateAsync({ id: formData.id, returnData });
    } else {
      await createReturn.mutateAsync(returnData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Returns</h1>
          <p className="text-muted-foreground mt-1">Track returned items from suppliers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="group transition-all duration-200 hover:scale-105">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              Add Return
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Return' : 'Log Return'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.selectedCategory} onValueChange={(val) => setFormData({ ...formData, selectedCategory: val })}>
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
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createReturn.isPending || updateReturn.isPending}>
                  {(createReturn.isPending || updateReturn.isPending) ? 'Saving...' : isEditing ? 'Update Return' : 'Save Return'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Banner */}
      {totalReturns > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-6 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
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
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns?.map((ret) => (
                <tr key={ret.id} className="group">
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
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(ret)}
                        className="text-primary hover:text-primary transition-transform hover:scale-110"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReturn.mutate(ret.id)}
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
