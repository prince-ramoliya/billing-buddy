import { useState } from 'react';
import { Plus, Pencil, Check, X, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Products() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const startEdit = (id: string, price: number) => {
    setEditingId(id);
    setEditPrice(price);
  };

  const saveEdit = (id: string) => {
    updateCategory.mutate({ id, category: { price_per_piece: editPrice } });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newPrice) return;

    await createCategory.mutateAsync({
      name: newName.trim(),
      price_per_piece: parseFloat(newPrice),
      is_active: true,
    });

    setIsAddDialogOpen(false);
    setNewName('');
    setNewPrice('');
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products / Categories</h1>
          <p className="text-muted-foreground mt-1">Manage your product categories and pricing</p>
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
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Polo T-Shirt"
                />
              </div>
              <div className="space-y-2">
                <Label>Price per Piece (₹) *</Label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g., 180"
                  min={0}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createCategory.isPending}>
                  {createCategory.isPending ? 'Saving...' : 'Save Category'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <div className="bg-card rounded-md border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading categories...</div>
        ) : categories?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No categories yet. Click "Add Category" to create one.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th className="numeric">Price per Piece</th>
                <th>Status</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((cat) => (
                <tr key={cat.id}>
                  <td className="font-medium">{cat.name}</td>
                  <td className="numeric">
                    {editingId === cat.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                          min={0}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span>₹{Number(cat.price_per_piece).toLocaleString()}</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                        cat.is_active
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Inactive'}
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
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(cat.id, Number(cat.price_per_piece))}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCategory.mutate(cat.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
