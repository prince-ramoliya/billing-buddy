import { useState, useEffect } from 'react';
import { Save, Building2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { data: categories } = useCategories();
  const updateSettings = useUpdateSettings();

  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name || '');
      setGstNumber(settings.gst_number || '');
      setCurrencySymbol(settings.currency_symbol || '₹');
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      company_name: companyName,
      gst_number: gstNumber || null,
      currency_symbol: currencySymbol,
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">Loading settings...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your company and billing preferences
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Company Info Card */}
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Company Information</h2>
              <p className="text-sm text-muted-foreground">
                This information appears on your invoices and reports
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="e.g., 27AABCS1234R1ZX"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Currency Symbol</Label>
              <Input
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="₹"
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Default Categories */}
        <div className="kpi-card">
          <h2 className="font-semibold mb-4">Product Categories</h2>
          <div className="space-y-3">
            {categories?.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <span className="font-medium">{cat.name}</span>
                <span className="text-muted-foreground">
                  ₹{Number(cat.price_per_piece).toLocaleString()}/piece
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Manage categories in the Products page for more options.
          </p>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full" disabled={updateSettings.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </AppLayout>
  );
}
