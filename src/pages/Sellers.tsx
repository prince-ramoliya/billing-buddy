import { useState } from 'react';
import { Plus, Phone, FileText, MoreVertical } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { mockSellers } from '@/lib/mockData';
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

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Sellers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your supplier relationships
          </p>
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
                <Input placeholder="e.g., Fashion Hub Supplier" />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input placeholder="e.g., 27AABCU9603R1ZM" />
              </div>
              <div className="space-y-2">
                <Label>Payment Notes</Label>
                <Textarea placeholder="e.g., Net 30 days, Bank transfer preferred..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Save Seller
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sellers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockSellers.map((seller) => (
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
                      seller.isActive
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {seller.isActive ? 'Active' : 'Inactive'}
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
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>View Orders</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Deactivate
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
              {seller.gstNumber && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="font-mono text-xs">{seller.gstNumber}</span>
                </div>
              )}
              {seller.paymentNotes && (
                <p className="text-muted-foreground pt-2 border-t">
                  {seller.paymentNotes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
