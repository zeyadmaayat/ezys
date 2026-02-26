import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useDpInventory, type DpInventorySummary, type DpInventoryScan } from '@/hooks/useDpInventory';
import { useWarehouses } from '@/hooks/useWarehouses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ScanBarcode, Play, Square, BarChart3, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function DpInventoryPage() {
  const { sessions, loading, createSession, closeSession, scanBarcode, getSummary, getScans } = useDpInventory();
  const { warehouses } = useWarehouses();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanResults, setScanResults] = useState<Array<{ barcode: string; result: string; time: string }>>([]);
  const [summary, setSummary] = useState<DpInventorySummary | null>(null);
  const [scans, setScans] = useState<DpInventoryScan[]>([]);

  const handleCreateSession = async () => {
    if (!selectedWarehouse) { toast.error('Select a warehouse'); return; }
    const result = await createSession(selectedWarehouse);
    if (result) {
      setCreateOpen(false);
      setActiveSession(result.id);
      setScanResults([]);
      setSummary(null);
    }
  };

  const handleScan = async () => {
    if (!activeSession || !barcodeInput.trim()) return;
    const result = await scanBarcode(activeSession, barcodeInput.trim());
    const resultLabels: Record<string, string> = {
      SCANNED_OK: '✅ Scanned successfully',
      ALREADY_SCANNED: '⚠️ Already scanned',
      SHIPMENT_NOT_FOUND: '❌ Shipment not found',
      WRONG_WAREHOUSE: '❌ Wrong warehouse',
      INVALID_SESSION: '❌ Invalid session',
      ERROR: '❌ Error occurred',
    };
    setScanResults(prev => [{ barcode: barcodeInput.trim(), result: resultLabels[result] || result, time: new Date().toLocaleTimeString() }, ...prev]);
    if (result === 'SCANNED_OK') toast.success('Scanned!');
    else toast.error(resultLabels[result] || result);
    setBarcodeInput('');
  };

  const handleViewSummary = async (sessionId: string) => {
    const [summaryData, scanData] = await Promise.all([
      getSummary(sessionId),
      getScans(sessionId),
    ]);
    setSummary(summaryData);
    setScans(scanData);
  };

  const handleCloseSession = async (sessionId: string) => {
    await closeSession(sessionId);
    if (activeSession === sessionId) {
      setActiveSession(null);
      setScanResults([]);
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">Inventory Audit</h1>
            <p className="text-muted-foreground">Scan-based inventory sessions</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Play className="mr-2 h-4 w-4" /> Start Session</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Start Inventory Session</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Warehouse *</Label>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateSession}>Start Session</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Scanning UI */}
        {activeSession && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ScanBarcode className="h-5 w-5 text-primary" />
                Active Scanning Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Scan or enter barcode (DP-...)"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan()}
                  autoFocus
                  className="font-mono"
                />
                <Button onClick={handleScan}>Scan</Button>
                <Button variant="outline" onClick={() => handleViewSummary(activeSession)}>
                  <BarChart3 className="mr-2 h-4 w-4" /> Summary
                </Button>
                <Button variant="destructive" onClick={() => handleCloseSession(activeSession)}>
                  <Square className="mr-2 h-4 w-4" /> Close
                </Button>
              </div>
              {scanResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {scanResults.map((r, i) => (
                    <div key={i} className="flex justify-between text-sm bg-card rounded-lg px-3 py-2 border border-border/40">
                      <span className="font-mono">{r.barcode}</span>
                      <span>{r.result}</span>
                      <span className="text-muted-foreground text-xs">{r.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        {summary && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{summary.expected_count}</div>
                  <p className="text-sm text-muted-foreground">Expected</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{summary.scanned_count}</div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><CheckCircle className="h-3 w-3" /> Scanned</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${summary.missing_count > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{summary.missing_count}</div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    {summary.missing_count > 0 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />} Missing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions History */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Session History</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Closed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No sessions yet</TableCell></TableRow>
              ) : sessions.map(s => {
                const wh = warehouses.find(w => w.id === s.warehouse_id);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{wh?.name || s.warehouse_id}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'OPEN' ? 'default' : 'secondary'}>
                        {s.status || 'OPEN'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{s.created_at ? format(new Date(s.created_at), 'MMM d, HH:mm') : '—'}</TableCell>
                    <TableCell className="text-sm">{s.closed_at ? format(new Date(s.closed_at), 'MMM d, HH:mm') : '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleViewSummary(s.id)}>
                          <BarChart3 className="mr-1 h-3 w-3" /> Summary
                        </Button>
                        {s.status === 'OPEN' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => { setActiveSession(s.id); setScanResults([]); }}>
                              <ScanBarcode className="mr-1 h-3 w-3" /> Scan
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleCloseSession(s.id)}>
                              <Square className="mr-1 h-3 w-3" /> Close
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
}
