import { useState } from 'react';
import { Plus, Phone, FileText, MoreVertical, Pencil } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useSellers, useCreateSeller, useUpdateSeller, useDeleteSeller } from '@/hooks/useSellers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SellerFormData {
  id?: string;
  name: string;
  contact: string;
  gstNumber: string;
  paymentNotes: string;
}

const initialFormData: SellerFormData = {
  name: '',
  contact: '',
  gstNumber: '',
  paymentNotes: '',
};

export default function Sellers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SellerFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  const { data: sellers, isLoading } = useSellers();
  const createSeller = useCreateSeller();
  const updateSeller = useUpdateSeller();
  const deleteSeller = useDeleteSeller();

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (seller: any) => {
    setFormData({
      id: seller.id,
      name: seller.name,
      contact: seller.contact || '',
      gstNumber: seller.gst_number || '',
      paymentNotes: seller.payment_notes || '',
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    const sellerData = {
      name: formData.name.trim(),
      contact: formData.contact || null,
      gst_number: formData.gstNumber || null,
      payment_notes: formData.paymentNotes || null,
      is_active: true,
    };

    if (isEditing && formData.id) {
      await updateSeller.mutateAsync({ id: formData.id, seller: sellerData });
    } else {
      await createSeller.mutateAsync(sellerData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeactivate = (id: string, currentStatus: boolean) => {
    updateSeller.mutate({ id, seller: { is_active: !currentStatus } });
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Sellers</h1>
          <p className="text-muted-foreground mt-1">Manage your supplier relationships</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="group transition-all duration-200 hover:scale-105">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              Add Seller
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Seller' : 'Add New Seller'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Seller Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fashion Hub Supplier"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="e.g., 27AABCU9603R1ZM"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Notes</Label>
                <Textarea
                  value={formData.paymentNotes}
                  onChange={(e) => setFormData({ ...formData, paymentNotes: e.target.value })}
                  placeholder="e.g., Net 30 days, Bank transfer preferred..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createSeller.isPending || updateSeller.isPending}>
                  {(createSeller.isPending || updateSeller.isPending) ? 'Saving...' : isEditing ? 'Update Seller' : 'Save Seller'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sellers Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading sellers...</div>
      ) : sellers?.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground bg-card rounded-md border">
          No sellers yet. Click "Add Seller" to create one.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sellers?.map((seller) => (
            <div key={seller.id} className="kpi-card group animate-fade-in hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold transition-transform group-hover:scale-110">
                    {seller.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{seller.name}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                        seller.is_active
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {seller.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(seller)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeactivate(seller.id, seller.is_active)}
                    >
                      {seller.is_active ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteSeller.mutate(seller.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm">
                {seller.contact && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{seller.contact}</span>
                  </div>
                )}
                {seller.gst_number && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="font-mono text-xs">{seller.gst_number}</span>
                  </div>
                )}
                {seller.payment_notes && (
                  <p className="text-muted-foreground pt-2 border-t">{seller.payment_notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
