import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Package, MapPin, Hash, Layers } from 'lucide-react';
import type { Inventory } from '@/types/erp';

interface Props {
  inventory: Inventory[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

export function InventoryFormView({ inventory, currentIndex, onNavigate, onClose }: Props) {
  const { language } = useLanguage();
  const item = inventory[currentIndex];
  if (!item) return null;

  const available = item.quantity - item.reserved_quantity;
  const isLow = available > 0 && available < 10;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Navigation bar */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
          ← {language === 'ar' ? 'رجوع' : 'Back to list'}
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground tabular-nums">
            {currentIndex + 1} / {inventory.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentIndex === 0}
            onClick={() => onNavigate(currentIndex - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentIndex === inventory.length - 1}
            onClick={() => onNavigate(currentIndex + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {item.item?.name || 'Unknown Item'}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">{item.item?.sku}</p>
            </div>
            <Badge variant={isLow ? 'destructive' : 'default'} className="text-sm px-3 py-1">
              {available} {language === 'ar' ? 'متاح' : 'Available'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {language === 'ar' ? 'الموقع' : 'Location'}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{item.location?.name || '—'}</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {language === 'ar' ? 'نوع الموقع' : 'Location Type'}
                </label>
                <p className="mt-1 capitalize">{item.location?.location_type?.replace('_', ' ') || '—'}</p>
              </div>
              {item.item?.barcode && (
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {language === 'ar' ? 'الباركود' : 'Barcode'}
                  </label>
                  <p className="mt-1 font-mono text-sm">{item.item.barcode}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {language === 'ar' ? 'الكمية الإجمالية' : 'Total Quantity'}
                </label>
                <p className="text-2xl font-bold tabular-nums mt-1">{item.quantity}</p>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {language === 'ar' ? 'المحجوز' : 'Reserved'}
                </label>
                <p className="text-lg font-semibold tabular-nums mt-1 text-muted-foreground">{item.reserved_quantity}</p>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {language === 'ar' ? 'الوحدة' : 'Unit'}
                </label>
                <p className="mt-1">{item.item?.unit || 'pcs'}</p>
              </div>
            </div>
          </div>

          {/* Stock bar */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              {language === 'ar' ? 'مستوى المخزون' : 'Stock Level'}
            </label>
            <div className="mt-2 h-3 rounded-full bg-muted/40 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isLow ? 'bg-destructive/70' : 'bg-primary/60'
                }`}
                style={{ width: `${Math.min(100, (available / Math.max(item.quantity, 1)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
              <span>{language === 'ar' ? 'محجوز' : 'Reserved'}: {item.reserved_quantity}</span>
              <span>{language === 'ar' ? 'متاح' : 'Available'}: {available}</span>
            </div>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            {language === 'ar' ? 'آخر تحديث' : 'Last updated'}: {new Date(item.updated_at).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
