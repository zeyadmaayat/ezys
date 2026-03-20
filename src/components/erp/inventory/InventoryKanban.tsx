import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Package } from 'lucide-react';
import type { Inventory } from '@/types/erp';

interface Props {
  inventory: Inventory[];
  onSelect: (item: Inventory) => void;
}

export function InventoryKanban({ inventory, onSelect }: Props) {
  const { language } = useLanguage();

  // Group by location
  const grouped = inventory.reduce<Record<string, Inventory[]>>((acc, inv) => {
    const loc = inv.location?.name || 'Unknown';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(inv);
    return acc;
  }, {});

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Object.entries(grouped).map(([locationName, items]) => {
        const totalQty = items.reduce((s, i) => s + i.quantity, 0);
        return (
          <div key={locationName} className="min-w-[280px] max-w-[320px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">{locationName}</h3>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {items.length} {language === 'ar' ? 'منتج' : 'items'} · {totalQty} {language === 'ar' ? 'وحدة' : 'units'}
              </Badge>
            </div>
            <div className="space-y-2">
              {items.map((inv) => {
                const available = inv.quantity - inv.reserved_quantity;
                const isLow = available > 0 && available < 10;
                const isOut = available <= 0;
                return (
                  <Card
                    key={inv.id}
                    onClick={() => onSelect(inv)}
                    className={`p-3 cursor-pointer transition-all duration-150 hover:shadow-md active:scale-[0.98] border ${
                      isOut ? 'border-destructive/30 bg-destructive/5' : isLow ? 'border-orange-300/50 bg-orange-50/50 dark:bg-orange-500/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{inv.item?.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{inv.item?.sku}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold tabular-nums leading-none">{inv.quantity}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {language === 'ar' ? 'متاح' : 'avail'}: {available}
                        </p>
                      </div>
                    </div>
                    {inv.reserved_quantity > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="h-1.5 flex-1 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${Math.min(100, (available / inv.quantity) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {inv.reserved_quantity} {language === 'ar' ? 'محجوز' : 'reserved'}
                        </span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
      {Object.keys(grouped).length === 0 && (
        <div className="flex-1 flex items-center justify-center py-20 text-muted-foreground">
          <Package className="w-8 h-8 mr-3 opacity-30" />
          {language === 'ar' ? 'لا يوجد مخزون' : 'No inventory found'}
        </div>
      )}
    </div>
  );
}
