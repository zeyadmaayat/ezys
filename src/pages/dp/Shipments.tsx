import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { useDpShipments } from '@/hooks/useDpShipments';
import { useDpDrivers } from '@/hooks/useDpDrivers';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useDpZones } from '@/hooks/useDpZones';
import { useDpShelves } from '@/hooks/useDpShelves';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, Search, Package, ChevronRight, AlertTriangle, Clock, History } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { DpShipmentStatus, DpStatusLog, CreateDpShipmentInput } from '@/types/domestic-pro';
import { DP_STATUS_LABELS, DP_VALID_TRANSITIONS } from '@/types/domestic-pro';
import { useDpRiskAlerts } from '@/hooks/useDpRiskAlerts';

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-slate-100 text-slate-700 border-slate-300',
  PICKED_UP: 'bg-amber-100 text-amber-700 border-amber-300',
  RECEIVED_AT_ORIGIN: 'bg-blue-100 text-blue-700 border-blue-300',
  IN_TRANSIT: 'bg-orange-100 text-orange-700 border-orange-300',
  RECEIVED_AT_DESTINATION: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700 border-purple-300',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  RETURNED: 'bg-red-100 text-red-700 border-red-300',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-300',
};

export default function DpShipments() {
  const { shipments, loading, createShipment, updateStatus, deleteShipment, getStatusLog } = useDpShipments();
  const { drivers } = useDpDrivers();
  const { warehouses } = useWarehouses();
  const { zones } = useDpZones();
  const { shelves } = useDpShelves();
  const { alerts: riskAlerts } = useDpRiskAlerts();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailShipment, setDetailShipment] = useState<string | null>(null);
  const [statusLog, setStatusLog] = useState<DpStatusLog[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [form, setForm] = useState<CreateDpShipmentInput>({
    sender_name: '', receiver_name: '',
  });

  // Fetch status log when detail opens
  useEffect(() => {
    if (detailShipment) {
      setLogLoading(true);
      getStatusLog(detailShipment).then(data => {
        setStatusLog(data);
        setLogLoading(false);
      });
    } else {
      setStatusLog([]);
    }
  }, [detailShipment]);

  const filtered = shipments.filter(s => {
    const matchSearch = !search || s.barcode.toLowerCase().includes(search.toLowerCase())
      || s.sender_name.toLowerCase().includes(search.toLowerCase())
      || s.receiver_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async () => {
    if (!form.sender_name || !form.receiver_name) {
      toast.error('Sender and receiver names are required');
      return;
    }
    const result = await createShipment(form);
    if (result) {
      setCreateOpen(false);
      setForm({ sender_name: '', receiver_name: '' });
    }
  };

  const handleStatusChange = async (id: string, currentStatus: DpShipmentStatus, newStatus: DpShipmentStatus) => {
    const updates: Record<string, unknown> = {};
    await updateStatus(id, newStatus, updates);
  };

  const selectedShipment = shipments.find(s => s.id === detailShipment);
  const selectedAlerts = riskAlerts.filter(a => a.shipment_id === detailShipment);

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
            <h1 className="text-3xl font-bold text-foreground">DP Shipments</h1>
            <p className="text-muted-foreground">{shipments.length} total shipments</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Shipment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Domestic Shipment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sender Name *</Label>
                    <Input value={form.sender_name} onChange={e => setForm({...form, sender_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sender Phone</Label>
                    <Input value={form.sender_phone || ''} onChange={e => setForm({...form, sender_phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sender City</Label>
                    <Input value={form.sender_city || ''} onChange={e => setForm({...form, sender_city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sender Address</Label>
                    <Input value={form.sender_address || ''} onChange={e => setForm({...form, sender_address: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Receiver Name *</Label>
                    <Input value={form.receiver_name} onChange={e => setForm({...form, receiver_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Receiver Phone</Label>
                    <Input value={form.receiver_phone || ''} onChange={e => setForm({...form, receiver_phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Receiver City</Label>
                    <Input value={form.receiver_city || ''} onChange={e => setForm({...form, receiver_city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Receiver Address</Label>
                    <Input value={form.receiver_address || ''} onChange={e => setForm({...form, receiver_address: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Origin Warehouse</Label>
                    <Select value={form.origin_warehouse_id || ''} onValueChange={v => setForm({...form, origin_warehouse_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination Warehouse</Label>
                    <Select value={form.destination_warehouse_id || ''} onValueChange={v => setForm({...form, destination_warehouse_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Driver</Label>
                    <Select value={form.driver_id || ''} onValueChange={v => setForm({...form, driver_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {drivers.filter(d => d.is_active).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" value={form.weight_kg || ''} onChange={e => setForm({...form, weight_kg: e.target.value ? Number(e.target.value) : undefined})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pieces</Label>
                    <Input type="number" value={form.pieces_count || ''} onChange={e => setForm({...form, pieces_count: e.target.value ? Number(e.target.value) : undefined})} />
                  </div>
                  <div className="space-y-2 flex items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={form.is_cod || false} onCheckedChange={c => setForm({...form, is_cod: !!c})} />
                      <Label>COD</Label>
                    </div>
                    {form.is_cod && (
                      <Input type="number" placeholder="COD Amount" value={form.cod_amount || ''} onChange={e => setForm({...form, cod_amount: Number(e.target.value)})} />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
                <Button onClick={handleCreate} className="w-full">Create Shipment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search barcode, sender, receiver..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.entries(DP_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>COD</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No shipments found
                  </TableCell>
                </TableRow>
              ) : filtered.map(s => {
                const validNext = DP_VALID_TRANSITIONS[s.status] || [];
                const shipmentData = s as any;
                const isSlaBreach = shipmentData.is_sla_breached === true;
                const hasExpectedDate = !!shipmentData.expected_delivery_at;
                return (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => setDetailShipment(s.id)}>
                    <TableCell className="font-mono text-sm font-semibold text-primary">
                      <div className="flex items-center gap-1.5">
                        {s.barcode}
                        {riskAlerts.some(a => a.shipment_id === s.id) && (
                          <span title="Risk alert triggered"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /></span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{s.sender_name}</div>
                      <div className="text-xs text-muted-foreground">{s.sender_city || '—'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{s.receiver_name}</div>
                      <div className="text-xs text-muted-foreground">{s.receiver_city || '—'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${STATUS_COLORS[s.status] || ''} border`}>
                        {DP_STATUS_LABELS[s.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isSlaBreach ? (
                        <Badge variant="destructive" className="gap-1 text-[10px]">
                          <Clock className="h-3 w-3" /> Breached
                        </Badge>
                      ) : hasExpectedDate ? (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(shipmentData.expected_delivery_at), 'MMM d')}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{s.driver?.name || '—'}</TableCell>
                    <TableCell>
                      {s.is_cod ? (
                        <span className="text-sm font-semibold text-amber-600">{s.cod_amount} SAR</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      {validNext.length > 0 && (
                        <Select onValueChange={(v) => handleStatusChange(s.id, s.status, v as DpShipmentStatus)}>
                          <SelectTrigger className="h-8 w-40 text-xs">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            {validNext.map(ns => (
                              <SelectItem key={ns} value={ns}>{DP_STATUS_LABELS[ns]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!detailShipment} onOpenChange={() => setDetailShipment(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {selectedShipment?.barcode}
              </DialogTitle>
            </DialogHeader>
            {selectedShipment && (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="timeline" className="flex-1 gap-1">
                    <History className="h-3.5 w-3.5" /> Timeline
                  </TabsTrigger>
                  {selectedAlerts.length > 0 && (
                    <TabsTrigger value="alerts" className="flex-1 gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Alerts ({selectedAlerts.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="details">
                  <div className="space-y-4">
                    {/* SLA Warning */}
                    {(selectedShipment as any).is_sla_breached && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                        <Clock className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">SLA Breached — Delivery exceeded expected time</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={`${STATUS_COLORS[selectedShipment.status]} border ml-1`}>{DP_STATUS_LABELS[selectedShipment.status]}</Badge></div>
                      <div><span className="text-muted-foreground">Pieces:</span> <span className="font-medium">{selectedShipment.pieces_count}</span></div>
                      <div><span className="text-muted-foreground">Sender:</span> <span className="font-medium">{selectedShipment.sender_name}</span></div>
                      <div><span className="text-muted-foreground">Receiver:</span> <span className="font-medium">{selectedShipment.receiver_name}</span></div>
                      <div><span className="text-muted-foreground">Sender City:</span> <span className="font-medium">{selectedShipment.sender_city || '—'}</span></div>
                      <div><span className="text-muted-foreground">Receiver City:</span> <span className="font-medium">{selectedShipment.receiver_city || '—'}</span></div>
                      <div><span className="text-muted-foreground">Origin WH:</span> <span className="font-medium">{selectedShipment.origin_warehouse?.name || '—'}</span></div>
                      <div><span className="text-muted-foreground">Dest WH:</span> <span className="font-medium">{selectedShipment.destination_warehouse?.name || '—'}</span></div>
                      <div><span className="text-muted-foreground">Current WH:</span> <span className="font-medium">{selectedShipment.current_warehouse?.name || '—'}</span></div>
                      <div><span className="text-muted-foreground">Driver:</span> <span className="font-medium">{selectedShipment.driver?.name || '—'}</span></div>
                      <div><span className="text-muted-foreground">Weight:</span> <span className="font-medium">{selectedShipment.weight_kg ? `${selectedShipment.weight_kg} kg` : '—'}</span></div>
                      {(selectedShipment as any).expected_delivery_at && (
                        <div><span className="text-muted-foreground">Expected Delivery:</span> <span className="font-medium">{format(new Date((selectedShipment as any).expected_delivery_at), 'MMM d, HH:mm')}</span></div>
                      )}
                      {(selectedShipment as any).delivered_at && (
                        <div><span className="text-muted-foreground">Delivered At:</span> <span className="font-medium text-emerald-600">{format(new Date((selectedShipment as any).delivered_at), 'MMM d, HH:mm')}</span></div>
                      )}
                      {(selectedShipment as any).returned_at && (
                        <div><span className="text-muted-foreground">Returned At:</span> <span className="font-medium text-red-600">{format(new Date((selectedShipment as any).returned_at), 'MMM d, HH:mm')}</span></div>
                      )}
                      {selectedShipment.is_cod && (
                        <div className="col-span-2"><span className="text-muted-foreground">COD Amount:</span> <span className="font-bold text-amber-600">{selectedShipment.cod_amount} SAR</span></div>
                      )}
                      {selectedShipment.zone && (
                        <div><span className="text-muted-foreground">Zone:</span> <span className="font-medium">{selectedShipment.zone.name}</span></div>
                      )}
                      {selectedShipment.shelf && (
                        <div><span className="text-muted-foreground">Shelf:</span> <span className="font-medium">{selectedShipment.shelf.name}</span></div>
                      )}
                    </div>
                    {selectedShipment.notes && (
                      <div className="bg-muted/30 rounded-lg p-3 text-sm">
                        <span className="text-muted-foreground font-medium">Notes:</span> {selectedShipment.notes}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="destructive" size="sm" onClick={async () => { await deleteShipment(selectedShipment.id); setDetailShipment(null); }}>
                        Delete Shipment
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline">
                  {logLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : statusLog.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No status history available</p>
                  ) : (
                    <div className="relative space-y-0 pl-6">
                      {/* Timeline line */}
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
                      {statusLog.map((log, i) => (
                        <div key={log.id} className="relative flex items-start gap-3 py-3">
                          <div className={`absolute left-[-13px] w-3 h-3 rounded-full border-2 ${
                            i === statusLog.length - 1 ? 'bg-primary border-primary' : 'bg-card border-border'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {log.old_status && (
                                <>
                                  <Badge variant="outline" className={`${STATUS_COLORS[log.old_status] || ''} border text-[10px]`}>
                                    {DP_STATUS_LABELS[log.old_status as DpShipmentStatus] || log.old_status}
                                  </Badge>
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                </>
                              )}
                              <Badge variant="outline" className={`${STATUS_COLORS[log.new_status] || ''} border text-[10px]`}>
                                {DP_STATUS_LABELS[log.new_status as DpShipmentStatus] || log.new_status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {log.created_at ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss') : '—'}
                            </p>
                            {log.notes && <p className="text-xs text-muted-foreground mt-0.5">{log.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {selectedAlerts.length > 0 && (
                  <TabsContent value="alerts">
                    <div className="space-y-2">
                      {selectedAlerts.map(a => (
                        <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <Badge variant="outline" className="text-[10px] mb-1">{a.alert_type}</Badge>
                            <p className="text-sm">{a.message || 'Risk alert triggered'}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {a.created_at ? format(new Date(a.created_at), 'MMM d, HH:mm') : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
