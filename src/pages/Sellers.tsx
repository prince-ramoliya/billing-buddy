import { useState } from 'react';
import { Plus, Phone, FileText, MoreVertical, Trash2 } from 'lucide-react';
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

export default function Sellers() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const { data: sellers, isLoading } = useSellers();
  const createSeller = useCreateSeller();
  const updateSeller = useUpdateSeller();
  const deleteSeller = useDeleteSeller();

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await createSeller.mutateAsync({
      name: name.trim(),
      contact: contact || null,
      gst_number: gstNumber || null,
      payment_notes: paymentNotes || null,
      is_active: true,
    });

    setIsAddDialogOpen(false);
    setName('');
    setContact('');
    setGstNumber('');
    setPaymentNotes('');
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Seller
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Seller</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Seller Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Fashion Hub Supplier"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g., 27AABCU9603R1ZM"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Notes</Label>
                <Textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g., Net 30 days, Bank transfer preferred..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createSeller.isPending}>
                  {createSeller.isPending ? 'Saving...' : 'Save Seller'}
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
            <div key={seller.id} className="kpi-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
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
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
