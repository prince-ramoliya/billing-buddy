import { useState } from 'react';
import { Plus, Pencil, Check, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { mockCategories } from '@/lib/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductCategory } from '@/types/billing';

export default function Products() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const startEdit = (cat: ProductCategory) => {
    setEditingId(cat.id);
    setEditPrice(cat.pricePerPiece);
  };

  const saveEdit = (id: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, pricePerPiece: editPrice } : cat
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products / Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product categories and pricing
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category Name *</Label>
                <Input placeholder="e.g., Polo T-Shirt" />
              </div>
              <div className="space-y-2">
                <Label>Price per Piece (₹) *</Label>
                <Input type="number" placeholder="e.g., 180" min={0} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Save Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <div className="bg-card rounded-md border shadow-sm overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th className="numeric">Price per Piece</th>
              <th>Status</th>
              <th className="w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="font-medium">{cat.name}</td>
                <td className="numeric">
                  {editingId === cat.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                        className="w-24 text-right"
                        min={0}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span>₹{cat.pricePerPiece}</span>
                  )}
                </td>
                <td>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                      cat.isActive
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {editingId === cat.id ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveEdit(cat.id)}
                        className="text-success hover:text-success"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelEdit}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
