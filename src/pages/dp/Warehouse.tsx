import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useDpZones } from '@/hooks/useDpZones';
import { useDpShelves } from '@/hooks/useDpShelves';
import { useWarehouses } from '@/hooks/useWarehouses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, Trash2, Warehouse, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';

export default function DpWarehouse() {
  const { warehouses } = useWarehouses();
  const { zones, loading: zonesLoading, createZone, deleteZone } = useDpZones();
  const { shelves, loading: shelvesLoading, createShelf, deleteShelf } = useDpShelves();
  const [zoneDialog, setZoneDialog] = useState(false);
  const [shelfDialog, setShelfDialog] = useState(false);
  const [zoneForm, setZoneForm] = useState({ warehouse_id: '', name: '', code: '' });
  const [shelfForm, setShelfForm] = useState({ zone_id: '', name: '', code: '', capacity: 100 });

  const handleCreateZone = async () => {
    if (!zoneForm.warehouse_id || !zoneForm.name || !zoneForm.code) { toast.error('All fields required'); return; }
    const result = await createZone(zoneForm);
    if (result) { setZoneDialog(false); setZoneForm({ warehouse_id: '', name: '', code: '' }); }
  };

  const handleCreateShelf = async () => {
    if (!shelfForm.zone_id || !shelfForm.name || !shelfForm.code) { toast.error('All fields required'); return; }
    const result = await createShelf(shelfForm);
    if (result) { setShelfDialog(false); setShelfForm({ zone_id: '', name: '', code: '', capacity: 100 }); }
  };

  const loading = zonesLoading || shelvesLoading;

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warehouse Layout</h1>
          <p className="text-muted-foreground">Manage zones and shelves for shipment storage</p>
        </div>

        <Tabs defaultValue="zones">
          <TabsList>
            <TabsTrigger value="zones" className="gap-1.5"><Warehouse className="h-4 w-4" /> Zones ({zones.length})</TabsTrigger>
            <TabsTrigger value="shelves" className="gap-1.5"><Grid3X3 className="h-4 w-4" /> Shelves ({shelves.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="zones" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={zoneDialog} onOpenChange={setZoneDialog}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Add Zone</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Zone</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Warehouse *</Label>
                      <Select value={zoneForm.warehouse_id} onValueChange={v => setZoneForm({...zoneForm, warehouse_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                        <SelectContent>
                          {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Zone Name *</Label>
                      <Input value={zoneForm.name} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} placeholder="e.g. Zone A" />
                    </div>
                    <div className="space-y-2">
                      <Label>Zone Code *</Label>
                      <Input value={zoneForm.code} onChange={e => setZoneForm({...zoneForm, code: e.target.value.toUpperCase()})} placeholder="e.g. ZA" />
                    </div>
                    <Button onClick={handleCreateZone}>Create Zone</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No zones created yet</TableCell></TableRow>
                  ) : zones.map(z => {
                    const wh = warehouses.find(w => w.id === z.warehouse_id);
                    return (
                      <TableRow key={z.id}>
                        <TableCell className="font-mono font-semibold text-primary">{z.code}</TableCell>
                        <TableCell className="font-medium">{z.name}</TableCell>
                        <TableCell>{wh?.name || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={z.is_active ? 'default' : 'secondary'}>{z.is_active ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteZone(z.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="shelves" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={shelfDialog} onOpenChange={setShelfDialog}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Add Shelf</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Shelf</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Zone *</Label>
                      <Select value={shelfForm.zone_id} onValueChange={v => setShelfForm({...shelfForm, zone_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                        <SelectContent>
                          {zones.map(z => <SelectItem key={z.id} value={z.id}>{z.code} — {z.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Shelf Name *</Label>
                      <Input value={shelfForm.name} onChange={e => setShelfForm({...shelfForm, name: e.target.value})} placeholder="e.g. Shelf 1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Shelf Code *</Label>
                      <Input value={shelfForm.code} onChange={e => setShelfForm({...shelfForm, code: e.target.value.toUpperCase()})} placeholder="e.g. S01" />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacity</Label>
                      <Input type="number" value={shelfForm.capacity} onChange={e => setShelfForm({...shelfForm, capacity: Number(e.target.value)})} />
                    </div>
                    <Button onClick={handleCreateShelf}>Create Shelf</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shelves.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No shelves created yet</TableCell></TableRow>
                  ) : shelves.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono font-semibold text-primary">{s.code}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.zone?.code || '—'} {s.zone?.name ? `— ${s.zone.name}` : ''}</TableCell>
                      <TableCell>{s.capacity}</TableCell>
                      <TableCell>
                        <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteShelf(s.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
