import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { mockReturns, mockSellers, mockCategories } from '@/lib/mockData';
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState(0);

  const selectedCategoryData = mockCategories.find((c) => c.id === selectedCategory);
  const deductionAmount = selectedCategoryData
    ? selectedCategoryData.pricePerPiece * quantity
    : 0;

  const totalReturns = mockReturns.reduce((sum, ret) => sum + ret.totalDeduction, 0);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Returns</h1>
          <p className="text-muted-foreground mt-1">
            Track returned items from suppliers
          </p>
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
                  <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                </div>
                <div className="space-y-2">
                  <Label>Seller</Label>
                  <Select>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} (₹{cat.pricePerPiece}/pc)
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
                <Textarea placeholder="e.g., Defective stitching, Wrong size..." />
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
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Save Return
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Banner */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-6 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div>
          <p className="font-medium text-destructive">
            Total Returns This Month: ₹{totalReturns.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            {mockReturns.length} items returned from {new Set(mockReturns.map((r) => r.sellerId)).size} suppliers
          </p>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-card rounded-md border shadow-sm overflow-hidden">
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
            </tr>
          </thead>
          <tbody>
            {mockReturns.map((ret) => (
              <tr key={ret.id}>
                <td>{format(ret.returnDate, 'dd MMM yyyy')}</td>
                <td className="font-medium">{ret.sellerName}</td>
                <td>{ret.categoryName}</td>
                <td className="numeric">{ret.quantity}</td>
                <td className="numeric">₹{ret.pricePerUnit}</td>
                <td className="numeric amount-negative">
                  -₹{ret.totalDeduction.toLocaleString()}
                </td>
                <td className="text-muted-foreground text-sm">
                  {ret.reason || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
