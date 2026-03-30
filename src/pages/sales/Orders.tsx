import { SalesLayout } from '@/components/sales/SalesLayout';
import { useOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

export default function SalesOrdersPage() {
  const { language } = useLanguage();
  const { orders, loading } = useOrders();

  return (
    <SalesLayout>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{language === 'ar' ? 'الطلبات' : 'Sales Orders'}</h1>
          <p className="text-sm text-muted-foreground">{language === 'ar' ? 'جميع طلبات المبيعات' : 'All sales orders'}</p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'رقم الطلب' : 'Order #'}</TableHead>
                  <TableHead>{language === 'ar' ? 'العميل' : 'Customer'}</TableHead>
                  <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : orders.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد طلبات' : 'No orders'}</TableCell></TableRow>
                ) : orders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                        {o.order_number || o.id.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell>{o.customer_name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{o.created_at ? format(new Date(o.created_at), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell className="font-medium">{(o.total_amount || 0).toLocaleString()} SAR</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{o.status || 'draft'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SalesLayout>
  );
}
