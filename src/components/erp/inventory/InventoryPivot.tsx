import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Inventory } from '@/types/erp';

interface Props {
  inventory: Inventory[];
}

export function InventoryPivot({ inventory }: Props) {
  const { language } = useLanguage();

  const pivot = useMemo(() => {
    const itemMap: Record<string, { name: string; sku: string; locations: Record<string, number>; total: number }> = {};
    const allLocations = new Set<string>();

    inventory.forEach((inv) => {
      const itemKey = inv.item_id;
      const locName = inv.location?.name || 'Unknown';
      allLocations.add(locName);

      if (!itemMap[itemKey]) {
        itemMap[itemKey] = { name: inv.item?.name || '', sku: inv.item?.sku || '', locations: {}, total: 0 };
      }
      itemMap[itemKey].locations[locName] = (itemMap[itemKey].locations[locName] || 0) + inv.quantity;
      itemMap[itemKey].total += inv.quantity;
    });

    return { items: Object.values(itemMap), locations: Array.from(allLocations).sort() };
  }, [inventory]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          {language === 'ar' ? 'جدول محوري: المنتجات × المواقع' : 'Pivot: Items × Locations'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">{language === 'ar' ? 'المنتج' : 'Item'}</TableHead>
                <TableHead className="font-bold">SKU</TableHead>
                {pivot.locations.map((loc) => (
                  <TableHead key={loc} className="text-center font-bold">{loc}</TableHead>
                ))}
                <TableHead className="text-center font-bold bg-primary/5">
                  {language === 'ar' ? 'الإجمالي' : 'Total'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pivot.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={pivot.locations.length + 3} className="text-center py-12 text-muted-foreground">
                    {language === 'ar' ? 'لا توجد بيانات' : 'No data'}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {pivot.items.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                      {pivot.locations.map((loc) => (
                        <TableCell key={loc} className="text-center tabular-nums">
                          {item.locations[loc] || <span className="text-muted-foreground/30">—</span>}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold tabular-nums bg-primary/5">{item.total}</TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow className="border-t-2 bg-muted/20 font-bold">
                    <TableCell colSpan={2}>{language === 'ar' ? 'الإجمالي' : 'Total'}</TableCell>
                    {pivot.locations.map((loc) => {
                      const locTotal = pivot.items.reduce((s, item) => s + (item.locations[loc] || 0), 0);
                      return (
                        <TableCell key={loc} className="text-center tabular-nums">{locTotal}</TableCell>
                      );
                    })}
                    <TableCell className="text-center tabular-nums bg-primary/5">
                      {pivot.items.reduce((s, item) => s + item.total, 0)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
