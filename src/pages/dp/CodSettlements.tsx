import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { useDpCodSettlements, type DpCodSettlementLine } from '@/hooks/useDpCodSettlements';
import { useDpDrivers } from '@/hooks/useDpDrivers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, DollarSign, Plus, Eye, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function DpCodSettlements() {
  const { settlements, loading, createSettlement, getLines, markCollected, closeSettlement } = useDpCodSettlements();
  const { drivers } = useDpDrivers();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [lines, setLines] = useState<DpCodSettlementLine[]>([]);
  const [linesLoading, setLinesLoading] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState('');

  const handleCreate = async () => {
    if (!selectedDriver) { toast.error('Select a driver'); return; }
    const result = await createSettlement(selectedDriver);
    if (result) {
      setCreateOpen(false);
      setSelectedDriver('');
    }
  };

  const handleViewLines = async (settlementId: string) => {
    setDetailId(settlementId);
    setLinesLoading(true);
    const data = await getLines(settlementId);
    setLines(data);
    setLinesLoading(false);
  };

  const handleToggleCollected = async (lineId: string, current: boolean) => {
    const success = await markCollected(lineId, !current);
    if (success) {
      setLines(prev => prev.map(l => l.id === lineId ? { ...l, collected: !current } : l));
    }
  };

  const handleClose = async () => {
    if (!detailId || !collectedAmount) { toast.error('Enter collected amount'); return; }
    const success = await closeSettlement(detailId, Number(collectedAmount));
    if (success) {
      setDetailId(null);
      setCollectedAmount('');
    }
  };

  const detailSettlement = settlements.find(s => s.id === detailId);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">COD Settlements</h1>
            <p className="text-muted-foreground">Cash on Delivery reconciliation</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Settlement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create COD Settlement</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Driver *</Label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                    <SelectContent>
                      {drivers.filter(d => d.is_active).map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This will auto-assign all delivered COD shipments for this driver.
                  </p>
                </div>
                <Button onClick={handleCreate}>Create Settlement</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Settlements Table */}
        <Card className="border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No settlements yet</TableCell></TableRow>
              ) : settlements.map(s => {
                const driver = drivers.find(d => d.id === s.driver_id);
                const isOpen = s.status === 'OPEN';
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{driver?.name || s.driver_id}</TableCell>
                    <TableCell>
                      <Badge variant={isOpen ? 'default' : 'secondary'} className={isOpen ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}>
                        {s.status || 'OPEN'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{(s.total_assigned || 0).toLocaleString()} SAR</TableCell>
                    <TableCell className="font-semibold text-emerald-600">{(s.total_collected || 0).toLocaleString()} SAR</TableCell>
                    <TableCell>
                      {(() => {
                        const v = s.variance || 0;
                        const colorClass = v < 0 ? 'text-red-600 bg-red-50 dark:bg-red-950/20' : v > 0 ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
                        return (
                          <span className={`font-semibold px-2 py-0.5 rounded ${colorClass}`}>
                            {v.toLocaleString()} SAR
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-sm">{s.created_at ? format(new Date(s.created_at), 'MMM d, HH:mm') : '—'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleViewLines(s.id)}>
                        <Eye className="mr-1 h-3 w-3" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!detailId} onOpenChange={() => { setDetailId(null); setLines([]); }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Settlement Details
                {detailSettlement && (
                  <Badge variant={detailSettlement.status === 'OPEN' ? 'default' : 'secondary'} className="ml-2">
                    {detailSettlement.status}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            {linesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                {detailSettlement && (
                  <div className="grid grid-cols-3 gap-4 text-center bg-muted/30 rounded-lg p-4">
                    <div>
                      <div className="text-xl font-bold">{(detailSettlement.total_assigned || 0).toLocaleString()} SAR</div>
                      <p className="text-xs text-muted-foreground">Total Assigned</p>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-emerald-600">{(detailSettlement.total_collected || 0).toLocaleString()} SAR</div>
                      <p className="text-xs text-muted-foreground">Total Collected</p>
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${(detailSettlement.variance || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {(detailSettlement.variance || 0).toLocaleString()} SAR
                      </div>
                      <p className="text-xs text-muted-foreground">Variance</p>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment</TableHead>
                      <TableHead>COD Amount</TableHead>
                      <TableHead>Collected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No lines</TableCell></TableRow>
                    ) : lines.map(l => (
                      <TableRow key={l.id}>
                        <TableCell className="font-mono text-sm">{l.shipment_id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-semibold">{l.cod_amount.toLocaleString()} SAR</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={l.collected || false}
                            onCheckedChange={() => handleToggleCollected(l.id, l.collected || false)}
                            disabled={detailSettlement?.status !== 'OPEN'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {detailSettlement?.status === 'OPEN' && (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Total Collected Amount (SAR)</Label>
                      <Input type="number" value={collectedAmount} onChange={e => setCollectedAmount(e.target.value)} placeholder="Enter total collected" />
                    </div>
                    <Button onClick={handleClose}>
                      <Lock className="mr-2 h-4 w-4" /> Close Settlement
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
