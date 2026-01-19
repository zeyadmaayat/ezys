import { useState } from 'react';
import { useShipmentCosts, CostType, ShipmentCost, COST_TYPE_LABELS } from '@/hooks/useShipmentCosts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const COST_TYPES: CostType[] = ['Freight', 'Customs', 'Clearance', 'Insurance', 'LastMile', 'Storage', 'Other'];

interface CostFormData {
  cost_type: CostType;
  estimate_amount: string;
  actual_amount: string;
  currency: string;
  vendor_name: string;
  notes: string;
}

const initialFormData: CostFormData = {
  cost_type: 'Freight',
  estimate_amount: '',
  actual_amount: '',
  currency: 'USD',
  vendor_name: '',
  notes: '',
};

interface CostsSectionProps {
  shipmentId: string;
}

export function CostsSection({ shipmentId }: CostsSectionProps) {
  const { language } = useLanguage();
  const { costs, loading, totals, addCost, updateCost, deleteCost } = useShipmentCosts(shipmentId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<ShipmentCost | null>(null);
  const [formData, setFormData] = useState<CostFormData>(initialFormData);

  const t = {
    costs: language === 'ar' ? 'التكاليف' : 'Costs',
    addCost: language === 'ar' ? 'إضافة تكلفة' : 'Add Cost',
    editCost: language === 'ar' ? 'تعديل التكلفة' : 'Edit Cost',
    type: language === 'ar' ? 'النوع' : 'Type',
    estimate: language === 'ar' ? 'التقدير' : 'Estimate',
    actual: language === 'ar' ? 'الفعلي' : 'Actual',
    currency: language === 'ar' ? 'العملة' : 'Currency',
    vendor: language === 'ar' ? 'المورد' : 'Vendor',
    notes: language === 'ar' ? 'ملاحظات' : 'Notes',
    save: language === 'ar' ? 'حفظ' : 'Save',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    totalEstimate: language === 'ar' ? 'إجمالي التقدير' : 'Total Estimate',
    totalActual: language === 'ar' ? 'إجمالي الفعلي' : 'Total Actual',
    variance: language === 'ar' ? 'الفرق' : 'Variance',
    noCosts: language === 'ar' ? 'لا توجد تكاليف' : 'No costs recorded yet',
  };

  const handleOpenDialog = (cost?: ShipmentCost) => {
    if (cost) {
      setEditingCost(cost);
      setFormData({
        cost_type: cost.cost_type,
        estimate_amount: cost.estimate_amount?.toString() || '',
        actual_amount: cost.actual_amount?.toString() || '',
        currency: cost.currency,
        vendor_name: cost.vendor_name || '',
        notes: cost.notes || '',
      });
    } else {
      setEditingCost(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const costData = {
      cost_type: formData.cost_type,
      estimate_amount: formData.estimate_amount ? parseFloat(formData.estimate_amount) : null,
      actual_amount: formData.actual_amount ? parseFloat(formData.actual_amount) : null,
      currency: formData.currency,
      vendor_name: formData.vendor_name || null,
      notes: formData.notes || null,
    };

    if (editingCost) {
      await updateCost(editingCost.id, costData);
    } else {
      await addCost(costData);
    }
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setEditingCost(null);
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t.costs}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t.costs}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                {t.addCost}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCost ? t.editCost : t.addCost}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">{t.type}</label>
                  <Select
                    value={formData.cost_type}
                    onValueChange={(v) => setFormData({ ...formData, cost_type: v as CostType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {COST_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">{t.estimate}</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.estimate_amount}
                      onChange={(e) => setFormData({ ...formData, estimate_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.actual}</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.actual_amount}
                      onChange={(e) => setFormData({ ...formData, actual_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">{t.currency}</label>
                    <Input
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                      placeholder="USD"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.vendor}</label>
                    <Input
                      value={formData.vendor_name}
                      onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                      placeholder="Vendor name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{t.notes}</label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button onClick={handleSave}>
                    {t.save}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Totals Card */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">{t.totalEstimate}</p>
            <p className="text-xl font-semibold">{formatCurrency(totals.totalEstimate, 'USD')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t.totalActual}</p>
            <p className="text-xl font-semibold">{formatCurrency(totals.totalActual, 'USD')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t.variance}</p>
            <div className="flex items-center gap-2">
              <p className={`text-xl font-semibold ${totals.variance > 0 ? 'text-red-600' : totals.variance < 0 ? 'text-green-600' : ''}`}>
                {formatCurrency(totals.variance, 'USD')}
              </p>
              {totals.variance !== 0 && (
                <Badge className={totals.variance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {totals.variance > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {totals.variancePercent !== null ? `${totals.variancePercent.toFixed(1)}%` : '—'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Costs Table */}
        {costs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">{t.noCosts}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.type}</TableHead>
                <TableHead>{t.estimate}</TableHead>
                <TableHead>{t.actual}</TableHead>
                <TableHead>{t.vendor}</TableHead>
                <TableHead className="text-right">{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costs.map(cost => (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium">{COST_TYPE_LABELS[cost.cost_type]}</TableCell>
                  <TableCell>{formatCurrency(cost.estimate_amount, cost.currency)}</TableCell>
                  <TableCell>{formatCurrency(cost.actual_amount, cost.currency)}</TableCell>
                  <TableCell>{cost.vendor_name || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(cost)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteCost(cost.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
